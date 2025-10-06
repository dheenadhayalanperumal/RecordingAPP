import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RecordingsList from '../components/RecordingsList';
import { SavedRecording } from '../services/AudioRecorderService';
import AudioRecorderService from '../services/AudioRecorderService';
import AudioPlaybackService from '../services/AudioPlaybackService';
import { usePlayer } from '../context/PlayerContext';

const RecordingsScreen: React.FC = () => {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { showGlobalPlayer } = usePlayer();

  useEffect(() => {
    loadRecordings();
  }, []);

  // Auto-sync recordings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecordings();
    }, [])
  );

  const loadRecordings = async (showLoading = false) => {
    try {
      if (showLoading) {
        setRefreshing(true);
      }
      const savedRecordings = await AudioRecorderService.getSavedRecordings();
      setRecordings(savedRecordings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      if (showLoading) {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = async () => {
    await loadRecordings(true);
  };

  const handlePlayRecording = async (recording: SavedRecording) => {
    // Load the recording for playback
    await AudioPlaybackService.loadRecording(recording);
    // Show the global player
    showGlobalPlayer(recording);
  };

  const handleDeleteRecording = async (id: string) => {
    try {
      const success = await AudioRecorderService.deleteRecording(id);
      if (success) {
        setRecordings(prev => prev.filter(r => r.id !== id));
        // Stop playback if the deleted recording was playing
        const currentState = AudioPlaybackService.getCurrentState();
        if (currentState.currentRecording?.id === id) {
          await AudioPlaybackService.stopPlayback();
        }
      }
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  return (
    <View style={styles.container}>
      <RecordingsList
        recordings={recordings}
        onRefresh={handleRefresh}
        onPlayRecording={handlePlayRecording}
        onDeleteRecording={handleDeleteRecording}
        refreshing={refreshing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default RecordingsScreen;
