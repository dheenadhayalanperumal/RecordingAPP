import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AudioRecorderService, { RecordingState } from '../services/AudioRecorderService';
import Waveform from './Waveform';

interface RecordingControlsProps {
  onRecordingComplete?: (recording: any) => void;
}

const { width } = Dimensions.get('window');

const RecordingControls: React.FC<RecordingControlsProps> = ({ onRecordingComplete }) => {
  const [recordingState, setRecordingState] = React.useState<RecordingState>(
    AudioRecorderService.getCurrentState()
  );

  React.useEffect(() => {
    const unsubscribe = AudioRecorderService.addStateListener((newState) => {
      console.log('RecordingControls received new state:', newState);
      setRecordingState(newState);
    });
    return unsubscribe;
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    console.log('Start recording button pressed');
    const success = await AudioRecorderService.startRecording();
    if (!success) {
      Alert.alert('Error', 'Failed to start recording. Please check permissions.');
    }
  };

  const handlePauseRecording = async () => {
    console.log('Pause recording button pressed');
    await AudioRecorderService.pauseRecording();
  };

  const handleResumeRecording = async () => {
    console.log('Resume recording button pressed');
    await AudioRecorderService.resumeRecording();
  };

  const handleStopRecording = async () => {
    console.log('Stop recording button pressed');
    const recording = await AudioRecorderService.stopRecording();
    if (recording && onRecordingComplete) {
      onRecordingComplete(recording);
    }
  };

  const getRecordingButton = () => {
    console.log('Rendering recording button. State:', {
      isRecording: recordingState.isRecording,
      isPaused: recordingState.isPaused
    });
    
    if (!recordingState.isRecording) {
      console.log('Rendering start button');
      return (
        <TouchableOpacity
          style={[styles.controlButton, styles.startButton]}
          onPress={handleStartRecording}
        >
          <Ionicons name="mic" size={40} color="white" />
        </TouchableOpacity>
      );
    }

    if (recordingState.isPaused) {
      console.log('Rendering resume button');
      return (
        <TouchableOpacity
          style={[styles.controlButton, styles.resumeButton]}
          onPress={handleResumeRecording}
        >
          <Ionicons name="play" size={40} color="white" />
        </TouchableOpacity>
      );
    }

    console.log('Rendering pause button');
    return (
      <TouchableOpacity
        style={[styles.controlButton, styles.pauseButton]}
        onPress={handlePauseRecording}
      >
        <Ionicons name="pause" size={40} color="white" />
      </TouchableOpacity>
    );
  };

  const getStatusText = () => {
    if (!recordingState.isRecording) {
      return 'Tap to start recording';
    }
    if (recordingState.isPaused) {
      return 'Recording paused';
    }
    return 'Recording...';
  };

  const getStatusColor = () => {
    if (!recordingState.isRecording) {
      return '#666';
    }
    if (recordingState.isPaused) {
      return '#ff9500';
    }
    return '#ff3b30';
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, { color: getStatusColor() }]}>
          {formatTime(recordingState.duration)}
        </Text>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {recordingState.isRecording && (
        <Waveform
          isRecording={recordingState.isRecording}
          isPaused={recordingState.isPaused}
          duration={recordingState.duration}
          color={getStatusColor()}
        />
      )}

      <View style={styles.controlsContainer}>
        {getRecordingButton()}
        
        {recordingState.isRecording && (
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStopRecording}
          >
            <Ionicons name="stop" size={30} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {recordingState.isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={[styles.indicatorDot, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.indicatorText}>
            {recordingState.isPaused ? 'PAUSED' : 'RECORDING'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: {
    backgroundColor: '#34c759',
  },
  pauseButton: {
    backgroundColor: '#ff9500',
  },
  resumeButton: {
    backgroundColor: '#007aff',
  },
  stopButton: {
    backgroundColor: '#ff3b30',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
});

export default RecordingControls;
