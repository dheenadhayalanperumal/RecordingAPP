import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import AudioPlaybackService, { PlaybackState } from '../services/AudioPlaybackService';
import { SavedRecording } from '../services/AudioRecorderService';
import Waveform from './Waveform';

interface PlaybackControlsProps {
  recording: SavedRecording;
  onPlaybackComplete?: () => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({ 
  recording, 
  onPlaybackComplete 
}) => {
  const [playbackState, setPlaybackState] = React.useState<PlaybackState>(
    AudioPlaybackService.getCurrentState()
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = AudioPlaybackService.addStateListener(setPlaybackState);
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    loadRecording();
    return () => {
      AudioPlaybackService.stopPlayback();
    };
  }, [recording.id]);

  const loadRecording = async () => {
    setIsLoading(true);
    const success = await AudioPlaybackService.loadRecording(recording);
    setIsLoading(false);
    if (!success) {
      Alert.alert('Error', 'Failed to load recording for playback.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = async () => {
    if (playbackState.isPaused) {
      await AudioPlaybackService.resume();
    } else {
      await AudioPlaybackService.play();
    }
  };

  const handlePause = async () => {
    await AudioPlaybackService.pause();
  };

  const handleStop = async () => {
    await AudioPlaybackService.stopPlayback();
    if (onPlaybackComplete) {
      onPlaybackComplete();
    }
  };

  const handleSeek = async (value: number) => {
    await AudioPlaybackService.seekTo(value);
  };

  const handleShare = async () => {
    const success = await AudioRecorderService.shareRecording(recording);
    if (!success) {
      Alert.alert('Error', 'Failed to share recording.');
    }
  };

  const isCurrentRecording = playbackState.currentRecording?.id === recording.id;
  const isPlaying = isCurrentRecording && playbackState.isPlaying;
  const isPaused = isCurrentRecording && playbackState.isPaused;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading recording...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.recordingName} numberOfLines={1}>
          {recording.name}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#007aff" />
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.currentTime}>
          {formatTime(isCurrentRecording ? playbackState.currentTime : 0)}
        </Text>
        <Text style={styles.duration}>
          {formatTime(recording.duration)}
        </Text>
      </View>

      <Waveform
        isRecording={false}
        isPaused={isPaused}
        duration={recording.duration}
        currentTime={isCurrentRecording ? playbackState.currentTime : 0}
        color="#007aff"
        height={120}
      />

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={recording.duration}
          value={isCurrentRecording ? playbackState.currentTime : 0}
          onValueChange={handleSeek}
          minimumTrackTintColor="#007aff"
          maximumTrackTintColor="#e0e0e0"
          thumbStyle={styles.sliderThumb}
        />
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={handleStop}
        >
          <Ionicons name="stop" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playPauseButton]}
          onPress={isPlaying ? handlePause : handlePlay}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Created: {recording.createdAt.toLocaleDateString()}
        </Text>
        <Text style={styles.infoText}>
          Duration: {formatTime(recording.duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  shareButton: {
    padding: 5,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  currentTime: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  duration: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#007aff',
    width: 20,
    height: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  stopButton: {
    backgroundColor: '#ff3b30',
    marginRight: 20,
  },
  playPauseButton: {
    backgroundColor: '#007aff',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholder: {
    width: 50,
    height: 50,
    marginLeft: 20,
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
});

export default PlaybackControls;
