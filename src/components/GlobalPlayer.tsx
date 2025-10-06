import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import AudioPlaybackService, { PlaybackState } from '../services/AudioPlaybackService';
import { SavedRecording } from '../services/AudioRecorderService';
import Waveform from './Waveform';

interface GlobalPlayerProps {
  recording: SavedRecording | null;
  onClose: () => void;
  onSeek: (position: number) => void;
}

const { width } = Dimensions.get('window');

const GlobalPlayer: React.FC<GlobalPlayerProps> = ({ recording, onClose, onSeek }) => {
  const [playbackState, setPlaybackState] = React.useState<PlaybackState>(
    AudioPlaybackService.getCurrentState()
  );

  React.useEffect(() => {
    if (!recording) return;
    
    const unsubscribe = AudioPlaybackService.addStateListener(setPlaybackState);
    return unsubscribe;
  }, [recording]);

  if (!recording) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (playbackState.isPlaying) {
      await AudioPlaybackService.pause();
    } else {
      await AudioPlaybackService.play();
    }
  };

  const handleSeek = async (value: number) => {
    await AudioPlaybackService.seekTo(value);
    onSeek(value);
  };

  const handleClose = async () => {
    // Stop playback when closing the player
    await AudioPlaybackService.stopPlayback();
    onClose();
  };

  const isCurrentRecording = playbackState.currentRecording?.id === recording.id;
  const isPlaying = isCurrentRecording && playbackState.isPlaying;
  const isPaused = isCurrentRecording && playbackState.isPaused;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.recordingName} numberOfLines={1}>
            {recording.name}
          </Text>
          <Text style={styles.recordingDuration}>
            {formatTime(recording.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.waveformContainer}>
        <Waveform
          isRecording={false}
          isPaused={isPaused}
          duration={recording.duration}
          currentTime={isCurrentRecording ? playbackState.currentTime : 0}
          color="#007aff"
          height={60}
        />
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.timeContainer}>
          <Text style={styles.currentTime}>
            {formatTime(isCurrentRecording ? playbackState.currentTime : 0)}
          </Text>
          <Text style={styles.duration}>
            {formatTime(recording.duration)}
          </Text>
        </View>

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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.playPauseButton]}
            onPress={handlePlayPause}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  recordingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  recordingDuration: {
    fontSize: 12,
    color: '#666',
  },
  waveformContainer: {
    marginBottom: 10,
  },
  controlsContainer: {
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentTime: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  slider: {
    width: '100%',
    height: 30,
  },
  sliderThumb: {
    backgroundColor: '#007aff',
    width: 16,
    height: 16,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playPauseButton: {
    backgroundColor: '#007aff',
  },
});

export default GlobalPlayer;
