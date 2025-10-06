# Audio Recorder App - API Documentation

## Overview

This document provides comprehensive API documentation for all services, components, and utilities in the Audio Recorder App.

## Services API

### AudioRecorderService

The core service for managing audio recording operations.

#### Methods

##### `initialize(): Promise<void>`
Initializes the audio recorder service and sets up audio mode.

**Returns**: Promise that resolves when initialization is complete.

**Example**:
```typescript
await AudioRecorderService.initialize();
```

##### `startRecording(): Promise<boolean>`
Starts a new audio recording session.

**Returns**: Promise that resolves to `true` if recording started successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioRecorderService.startRecording();
if (success) {
  console.log('Recording started');
} else {
  console.log('Failed to start recording');
}
```

##### `pauseRecording(): Promise<boolean>`
Pauses the current recording session.

**Returns**: Promise that resolves to `true` if recording was paused successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioRecorderService.pauseRecording();
```

##### `resumeRecording(): Promise<boolean>`
Resumes a paused recording session.

**Returns**: Promise that resolves to `true` if recording was resumed successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioRecorderService.resumeRecording();
```

##### `stopRecording(): Promise<SavedRecording | null>`
Stops the current recording and saves it to storage.

**Returns**: Promise that resolves to a `SavedRecording` object if successful, `null` if failed.

**Example**:
```typescript
const recording = await AudioRecorderService.stopRecording();
if (recording) {
  console.log('Recording saved:', recording.name);
}
```

##### `getCurrentState(): RecordingState`
Gets the current recording state.

**Returns**: Current recording state object.

**Example**:
```typescript
const state = AudioRecorderService.getCurrentState();
console.log('Is recording:', state.isRecording);
```

##### `addStateListener(listener: (state: RecordingState) => void): () => void`
Adds a listener for recording state changes.

**Parameters**:
- `listener`: Function to call when state changes

**Returns**: Unsubscribe function to remove the listener.

**Example**:
```typescript
const unsubscribe = AudioRecorderService.addStateListener((state) => {
  console.log('Recording state changed:', state);
});

// Later, to unsubscribe
unsubscribe();
```

##### `getSavedRecordings(): Promise<SavedRecording[]>`
Gets all saved recordings from storage.

**Returns**: Promise that resolves to an array of saved recordings.

**Example**:
```typescript
const recordings = await AudioRecorderService.getSavedRecordings();
console.log('Found', recordings.length, 'recordings');
```

##### `saveRecording(recording: SavedRecording): Promise<void>`
Saves a recording to storage.

**Parameters**:
- `recording`: Recording object to save

**Example**:
```typescript
await AudioRecorderService.saveRecording(recording);
```

##### `deleteRecording(id: string): Promise<boolean>`
Deletes a recording by ID.

**Parameters**:
- `id`: ID of the recording to delete

**Returns**: Promise that resolves to `true` if deleted successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioRecorderService.deleteRecording('recording-id');
```

##### `shareRecording(recording: SavedRecording): Promise<boolean>`
Shares a recording using the system share sheet.

**Parameters**:
- `recording`: Recording object to share

**Returns**: Promise that resolves to `true` if sharing was initiated successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioRecorderService.shareRecording(recording);
```

#### Types

##### `RecordingState`
```typescript
interface RecordingState {
  isRecording: boolean;    // Whether currently recording
  isPaused: boolean;       // Whether recording is paused
  duration: number;        // Current recording duration in seconds
  uri: string | null;      // File URI of current recording
  name: string;           // Name of current recording
}
```

##### `SavedRecording`
```typescript
interface SavedRecording {
  id: string;             // Unique identifier
  name: string;           // Recording name
  uri: string;            // File URI
  duration: number;       // Duration in seconds
  createdAt: Date;        // Creation timestamp
}
```

### AudioPlaybackService

Service for managing audio playback operations.

#### Methods

##### `loadRecording(recording: SavedRecording): Promise<boolean>`
Loads a recording for playback.

**Parameters**:
- `recording`: Recording object to load

**Returns**: Promise that resolves to `true` if loaded successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.loadRecording(recording);
```

##### `play(): Promise<boolean>`
Starts or resumes playback.

**Returns**: Promise that resolves to `true` if playback started successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.play();
```

##### `pause(): Promise<boolean>`
Pauses playback.

**Returns**: Promise that resolves to `true` if paused successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.pause();
```

##### `resume(): Promise<boolean>`
Resumes paused playback.

**Returns**: Promise that resolves to `true` if resumed successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.resume();
```

##### `stopPlayback(): Promise<boolean>`
Stops playback and unloads the current recording.

**Returns**: Promise that resolves to `true` if stopped successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.stopPlayback();
```

##### `seekTo(position: number): Promise<boolean>`
Seeks to a specific position in the recording.

**Parameters**:
- `position`: Position in seconds

**Returns**: Promise that resolves to `true` if seek was successful, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.seekTo(60); // Seek to 1 minute
```

##### `setVolume(volume: number): Promise<boolean>`
Sets the playback volume.

**Parameters**:
- `volume`: Volume level (0.0 to 1.0)

**Returns**: Promise that resolves to `true` if volume was set successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.setVolume(0.5); // 50% volume
```

##### `setPlaybackRate(rate: number): Promise<boolean>`
Sets the playback rate.

**Parameters**:
- `rate`: Playback rate (0.5 to 2.0)

**Returns**: Promise that resolves to `true` if rate was set successfully, `false` otherwise.

**Example**:
```typescript
const success = await AudioPlaybackService.setPlaybackRate(1.5); // 1.5x speed
```

##### `getCurrentState(): PlaybackState`
Gets the current playback state.

**Returns**: Current playback state object.

**Example**:
```typescript
const state = AudioPlaybackService.getCurrentState();
console.log('Is playing:', state.isPlaying);
```

##### `addStateListener(listener: (state: PlaybackState) => void): () => void`
Adds a listener for playback state changes.

**Parameters**:
- `listener`: Function to call when state changes

**Returns**: Unsubscribe function to remove the listener.

**Example**:
```typescript
const unsubscribe = AudioPlaybackService.addStateListener((state) => {
  console.log('Playback state changed:', state);
});
```

#### Types

##### `PlaybackState`
```typescript
interface PlaybackState {
  isPlaying: boolean;      // Whether currently playing
  isPaused: boolean;       // Whether playback is paused
  currentTime: number;     // Current playback position in seconds
  duration: number;        // Total duration in seconds
  currentRecording: SavedRecording | null; // Currently loaded recording
}
```

### AudioAnalysisService

Service for providing real-time audio analysis data.

#### Methods

##### `startAnalysis(): void`
Starts real-time audio analysis.

**Example**:
```typescript
AudioAnalysisService.startAnalysis();
```

##### `stopAnalysis(): void`
Stops real-time audio analysis.

**Example**:
```typescript
AudioAnalysisService.stopAnalysis();
```

##### `addAnalysisListener(listener: (data: AudioAnalysisData) => void): () => void`
Adds a listener for audio analysis data.

**Parameters**:
- `listener`: Function to call with analysis data

**Returns**: Unsubscribe function to remove the listener.

**Example**:
```typescript
const unsubscribe = AudioAnalysisService.addAnalysisListener((data) => {
  console.log('Amplitude:', data.amplitude);
  console.log('Pitch:', data.pitch);
});
```

##### `analyzeAudioBuffer(buffer: ArrayBuffer): Promise<AudioAnalysisData>`
Analyzes an audio buffer (future implementation).

**Parameters**:
- `buffer`: Audio buffer to analyze

**Returns**: Promise that resolves to analysis data.

##### `getFrequencyData(): Promise<Float32Array>`
Gets frequency domain data (future implementation).

**Returns**: Promise that resolves to frequency data array.

##### `getPitchEstimate(): Promise<number>`
Gets pitch estimate (future implementation).

**Returns**: Promise that resolves to pitch value.

##### `cleanup(): void`
Cleans up analysis resources.

**Example**:
```typescript
AudioAnalysisService.cleanup();
```

#### Types

##### `AudioAnalysisData`
```typescript
interface AudioAnalysisData {
  amplitude: number;       // Audio amplitude (0.0 to 1.0)
  frequency: number;       // Dominant frequency in Hz
  pitch: number;          // Pitch value (0.0 to 1.0)
  intensity: number;      // Voice intensity (0.0 to 1.0)
  timestamp: number;      // Timestamp of analysis
}
```

### InterruptionService

Service for managing audio interruptions and app state changes.

#### Methods

##### `initialize(): Promise<void>`
Initializes the interruption service.

**Returns**: Promise that resolves when initialization is complete.

**Example**:
```typescript
await InterruptionService.initialize();
```

##### `handleAppStateChange(nextAppState: AppStateStatus): void`
Handles app state changes.

**Parameters**:
- `nextAppState`: New app state

**Example**:
```typescript
InterruptionService.handleAppStateChange('background');
```

##### `handleInterruption(event: InterruptionEvent): Promise<void>`
Handles audio interruption events.

**Parameters**:
- `event`: Interruption event object

**Example**:
```typescript
await InterruptionService.handleInterruption({
  type: 'call',
  timestamp: new Date(),
  handled: false
});
```

##### `resumeAfterInterruption(): Promise<void>`
Resumes recording after an interruption.

**Example**:
```typescript
await InterruptionService.resumeAfterInterruption();
```

##### `addInterruptionListener(listener: (event: InterruptionEvent) => void): () => void`
Adds a listener for interruption events.

**Parameters**:
- `listener`: Function to call when interruption occurs

**Returns**: Unsubscribe function to remove the listener.

**Example**:
```typescript
const unsubscribe = InterruptionService.addInterruptionListener((event) => {
  console.log('Interruption:', event.type);
});
```

##### `getInterruptionHistory(): InterruptionEvent[]`
Gets the history of interruption events.

**Returns**: Array of interruption events.

**Example**:
```typescript
const history = InterruptionService.getInterruptionHistory();
console.log('Interruptions:', history.length);
```

##### `clearInterruptionHistory(): void`
Clears the interruption history.

**Example**:
```typescript
InterruptionService.clearInterruptionHistory();
```

##### `simulateInterruption(type: InterruptionEvent['type']): Promise<void>`
Simulates an interruption for testing.

**Parameters**:
- `type`: Type of interruption to simulate

**Example**:
```typescript
await InterruptionService.simulateInterruption('call');
```

##### `cleanup(): Promise<void>`
Cleans up interruption service resources.

**Returns**: Promise that resolves when cleanup is complete.

**Example**:
```typescript
await InterruptionService.cleanup();
```

#### Types

##### `InterruptionEvent`
```typescript
interface InterruptionEvent {
  type: 'call' | 'notification' | 'other_app' | 'system_alert' | 'app_background' | 'app_foreground';
  timestamp: Date;
  handled: boolean;
}
```

## Component API

### PlayerContext

React Context for managing global player state.

#### Hook: `usePlayer()`

Returns the player context value.

**Returns**: PlayerContextType object.

**Example**:
```typescript
const { currentRecording, showGlobalPlayer, hideGlobalPlayer } = usePlayer();
```

#### Types

##### `PlayerContextType`
```typescript
interface PlayerContextType {
  currentRecording: SavedRecording | null;
  setCurrentRecording: (recording: SavedRecording | null) => void;
  isGlobalPlayerVisible: boolean;
  setIsGlobalPlayerVisible: (visible: boolean) => void;
  showGlobalPlayer: (recording: SavedRecording) => void;
  hideGlobalPlayer: () => Promise<void>;
}
```

### Components

#### `RecordingControls`

Main recording interface component.

**Props**:
```typescript
interface RecordingControlsProps {
  onRecordingComplete?: (recording: SavedRecording) => void;
}
```

**Example**:
```typescript
<RecordingControls 
  onRecordingComplete={(recording) => {
    console.log('Recording completed:', recording.name);
  }}
/>
```

#### `PlaybackControls`

Full-featured playback controls component.

**Props**:
```typescript
interface PlaybackControlsProps {
  recording: SavedRecording;
  onPlaybackComplete?: () => void;
}
```

**Example**:
```typescript
<PlaybackControls 
  recording={recording}
  onPlaybackComplete={() => {
    console.log('Playback completed');
  }}
/>
```

#### `GlobalPlayer`

Compact global player component.

**Props**:
```typescript
interface GlobalPlayerProps {
  recording: SavedRecording | null;
  onClose: () => void;
  onSeek: (position: number) => void;
}
```

**Example**:
```typescript
<GlobalPlayer 
  recording={currentRecording}
  onClose={() => setPlayerVisible(false)}
  onSeek={(position) => console.log('Seek to:', position)}
/>
```

#### `Waveform`

Waveform visualization component.

**Props**:
```typescript
interface WaveformProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  currentTime?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}
```

**Example**:
```typescript
<Waveform 
  isRecording={true}
  isPaused={false}
  duration={120}
  currentTime={60}
  height={100}
  color="#007aff"
/>
```

#### `RecordingsList`

List of saved recordings component.

**Props**:
```typescript
interface RecordingsListProps {
  recordings: SavedRecording[];
  onRefresh: () => void;
  onPlayRecording: (recording: SavedRecording) => void;
  onDeleteRecording: (id: string) => void;
  refreshing: boolean;
}
```

**Example**:
```typescript
<RecordingsList 
  recordings={recordings}
  onRefresh={handleRefresh}
  onPlayRecording={handlePlayRecording}
  onDeleteRecording={handleDeleteRecording}
  refreshing={refreshing}
/>
```

## Utility Functions

### Time Formatting

#### `formatTime(seconds: number): string`
Formats seconds into MM:SS format.

**Parameters**:
- `seconds`: Number of seconds

**Returns**: Formatted time string.

**Example**:
```typescript
const formatted = formatTime(125); // "02:05"
```

### File Management

#### `generateFileName(timestamp?: Date): string`
Generates a unique filename for recordings.

**Parameters**:
- `timestamp`: Optional timestamp (defaults to current time)

**Returns**: Generated filename.

**Example**:
```typescript
const filename = generateFileName(); // "recording_2024-01-15T10-30-45-123Z.mp4"
```

## Error Handling

### Common Error Types

#### `RecordingError`
```typescript
class RecordingError extends Error {
  code: 'PERMISSION_DENIED' | 'AUDIO_MODE_FAILED' | 'RECORDING_FAILED' | 'FILE_SAVE_FAILED';
  details?: any;
}
```

#### `PlaybackError`
```typescript
class PlaybackError extends Error {
  code: 'LOAD_FAILED' | 'PLAY_FAILED' | 'SEEK_FAILED' | 'VOLUME_FAILED';
  details?: any;
}
```

### Error Handling Examples

```typescript
try {
  const success = await AudioRecorderService.startRecording();
  if (!success) {
    throw new RecordingError('Failed to start recording', 'RECORDING_FAILED');
  }
} catch (error) {
  if (error instanceof RecordingError) {
    console.error('Recording error:', error.code, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Best Practices

### Service Usage

1. **Always initialize services** before use:
```typescript
await AudioRecorderService.initialize();
await InterruptionService.initialize();
```

2. **Handle errors gracefully**:
```typescript
try {
  await AudioRecorderService.startRecording();
} catch (error) {
  // Handle error appropriately
}
```

3. **Clean up listeners** to prevent memory leaks:
```typescript
const unsubscribe = AudioRecorderService.addStateListener(listener);
// Later...
unsubscribe();
```

### Component Usage

1. **Use context hooks** within providers:
```typescript
const MyComponent = () => {
  const { showGlobalPlayer } = usePlayer(); // Must be within PlayerProvider
  // ...
};
```

2. **Handle loading states**:
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await someAsyncOperation();
  } finally {
    setLoading(false);
  }
};
```

3. **Optimize re-renders** with proper dependencies:
```typescript
useEffect(() => {
  // Effect logic
}, [dependency1, dependency2]); // Only re-run when dependencies change
```

## Testing

### Service Testing

```typescript
// Mock dependencies
jest.mock('expo-av');
jest.mock('expo-file-system/legacy');

// Test service methods
describe('AudioRecorderService', () => {
  it('should start recording successfully', async () => {
    const result = await AudioRecorderService.startRecording();
    expect(result).toBe(true);
  });
});
```

### Component Testing

```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('RecordingControls', () => {
  it('should call onRecordingComplete when recording stops', async () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <RecordingControls onRecordingComplete={onComplete} />
    );
    
    fireEvent.press(getByTestId('start-button'));
    fireEvent.press(getByTestId('stop-button'));
    
    expect(onComplete).toHaveBeenCalled();
  });
});
```
