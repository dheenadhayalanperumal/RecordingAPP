import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import RecordingControls from '../components/RecordingControls';
import { SavedRecording } from '../services/AudioRecorderService';
import AudioPlaybackService from '../services/AudioPlaybackService';
import { usePlayer } from '../context/PlayerContext';

interface RecordingScreenProps {
  onRecordingComplete?: (recording: SavedRecording) => void;
}

const RecordingScreen: React.FC<RecordingScreenProps> = ({ onRecordingComplete }) => {
  const { showGlobalPlayer } = usePlayer();

  const handleRecordingComplete = async (recording: SavedRecording) => {
    // Load the recording for playback
    await AudioPlaybackService.loadRecording(recording);
    // Show the global player
    showGlobalPlayer(recording);
    
    if (onRecordingComplete) {
      onRecordingComplete(recording);
    }
  };

  return (
    <View style={styles.container}>
      <RecordingControls onRecordingComplete={handleRecordingComplete} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default RecordingScreen;
