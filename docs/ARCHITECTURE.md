# Audio Recorder App - Architecture Documentation

## Overview

The Audio Recorder App is a React Native application built with Expo that provides comprehensive audio recording and playback functionality. The app features background recording, interruption handling, and a modern UI with real-time waveform visualization.

## Architecture Principles

### 1. **Service-Oriented Architecture**
- Core functionality is encapsulated in dedicated service classes
- Services handle specific domains (recording, playback, analysis, interruptions)
- Singleton pattern ensures consistent state across the application

### 2. **Component-Based UI**
- Reusable React components with clear separation of concerns
- Context-based state management for global player functionality
- Responsive design with platform-specific optimizations

### 3. **Event-Driven Communication**
- Services communicate through event listeners and callbacks
- State changes are propagated through observer pattern
- Loose coupling between components and services

## Core Services

### AudioRecorderService
**Purpose**: Manages all audio recording operations and state.

**Key Responsibilities**:
- Audio recording lifecycle (start, pause, resume, stop)
- File management and storage
- Permission handling
- State persistence
- Background recording support

**Key Methods**:
```typescript
// Core recording operations
startRecording(): Promise<boolean>
pauseRecording(): Promise<boolean>
resumeRecording(): Promise<boolean>
stopRecording(): Promise<SavedRecording | null>

// State management
getCurrentState(): RecordingState
addStateListener(listener: (state: RecordingState) => void): () => void

// File management
getSavedRecordings(): Promise<SavedRecording[]>
saveRecording(recording: SavedRecording): Promise<void>
deleteRecording(id: string): Promise<boolean>
```

### AudioPlaybackService
**Purpose**: Handles audio playback functionality and controls.

**Key Responsibilities**:
- Audio file loading and playback
- Playback state management
- Seek and volume controls
- Playback progress tracking

**Key Methods**:
```typescript
// Playback operations
loadRecording(recording: SavedRecording): Promise<boolean>
play(): Promise<boolean>
pause(): Promise<boolean>
resume(): Promise<boolean>
stopPlayback(): Promise<boolean>

// Controls
seekTo(position: number): Promise<boolean>
setVolume(volume: number): Promise<boolean>
setPlaybackRate(rate: number): Promise<boolean>
```

### AudioAnalysisService
**Purpose**: Provides real-time audio analysis for waveform visualization.

**Key Responsibilities**:
- Simulated audio analysis (amplitude, frequency, pitch, intensity)
- Real-time data generation for waveform animation
- Analysis state management

**Key Methods**:
```typescript
// Analysis control
startAnalysis(): void
stopAnalysis(): void
addAnalysisListener(listener: (data: AudioAnalysisData) => void): () => void

// Analysis data
generateSimulatedAnalysis(): AudioAnalysisData
```

### InterruptionService
**Purpose**: Manages audio interruptions and app state changes.

**Key Responsibilities**:
- App state monitoring
- Audio interruption handling
- Background/foreground transitions
- Call and notification interruptions

**Key Methods**:
```typescript
// Interruption handling
handleAppStateChange(nextAppState: AppStateStatus): void
handleInterruption(event: InterruptionEvent): Promise<void>
resumeAfterInterruption(): Promise<void>

// Event management
addInterruptionListener(listener: (event: InterruptionEvent) => void): () => void
```

## Component Architecture

### Global Player System
The app features a global player that can be displayed above the tab bar, allowing users to continue playing audio while navigating between screens.

**Components**:
- `PlayerContext`: React Context for global player state
- `GlobalPlayer`: Compact player component
- `PlayerProvider`: Context provider wrapper

### Recording Interface
**Components**:
- `RecordingControls`: Main recording interface with start/pause/stop controls
- `Waveform`: Real-time waveform visualization
- `RecordingScreen`: Screen container for recording functionality

### Playback Interface
**Components**:
- `PlaybackControls`: Full-featured playback controls
- `RecordingsList`: List of saved recordings
- `RecordingsScreen`: Screen container for recordings management

## State Management

### Recording State
```typescript
interface RecordingState {
  isRecording: boolean;    // Whether currently recording
  isPaused: boolean;       // Whether recording is paused
  duration: number;        // Current recording duration in seconds
  uri: string | null;      // File URI of current recording
  name: string;           // Name of current recording
}
```

### Playback State
```typescript
interface PlaybackState {
  isPlaying: boolean;      // Whether currently playing
  isPaused: boolean;       // Whether playback is paused
  currentTime: number;     // Current playback position in seconds
  duration: number;        // Total duration in seconds
  currentRecording: SavedRecording | null; // Currently loaded recording
}
```

### Global Player State
```typescript
interface PlayerContextType {
  currentRecording: SavedRecording | null;     // Currently playing recording
  isGlobalPlayerVisible: boolean;              // Whether global player is shown
  showGlobalPlayer: (recording: SavedRecording) => void;
  hideGlobalPlayer: () => Promise<void>;
}
```

## Data Flow

### Recording Flow
1. User taps record button
2. `RecordingControls` calls `AudioRecorderService.startRecording()`
3. Service requests permissions and sets up audio mode
4. Recording starts and state updates are propagated
5. `Waveform` component receives real-time analysis data
6. User can pause/resume/stop recording
7. On stop, recording is saved and `onRecordingComplete` callback is triggered

### Playback Flow
1. User selects recording from list
2. `RecordingsList` calls `onPlayRecording` callback
3. `RecordingsScreen` loads recording via `AudioPlaybackService`
4. Global player is shown with `PlayerContext.showGlobalPlayer()`
5. User can control playback through `GlobalPlayer` component
6. Playback state is managed by `AudioPlaybackService`

### Interruption Flow
1. System interruption occurs (call, notification, etc.)
2. `InterruptionService` detects interruption
3. Service pauses current recording if active
4. Interruption event is logged and listeners are notified
5. User can resume recording after interruption ends

## File Structure

```
src/
├── components/           # Reusable UI components
│   ├── GlobalPlayer.tsx     # Global audio player
│   ├── PlaybackControls.tsx # Full playback controls
│   ├── RecordingControls.tsx # Recording interface
│   ├── RecordingsList.tsx   # List of saved recordings
│   └── Waveform.tsx         # Waveform visualization
├── context/             # React Context providers
│   └── PlayerContext.tsx    # Global player state
├── navigation/          # Navigation configuration
│   └── TabNavigator.tsx     # Bottom tab navigation
├── screens/            # Screen components
│   ├── RecordingScreen.tsx  # Recording screen
│   └── RecordingsScreen.tsx # Recordings list screen
└── services/           # Core business logic
    ├── AudioAnalysisService.ts    # Audio analysis
    ├── AudioPlaybackService.ts    # Playback management
    ├── AudioRecorderService.ts    # Recording management
    └── InterruptionService.ts     # Interruption handling
```

## Platform Considerations

### iOS
- Uses `UIBackgroundModes = ["audio"]` for background recording
- Requires microphone and media library permissions
- Optimized for iOS audio session management
- Uses MP4 format for better compatibility

### Android
- Requires `RECORD_AUDIO` and storage permissions
- Supports background recording with proper service configuration
- Handles audio focus and ducking
- Uses MP4 format for universal compatibility

## Performance Optimizations

### Audio Processing
- Efficient audio analysis with 20 FPS updates
- Optimized waveform rendering with SVG
- Proper cleanup of audio resources

### Memory Management
- Singleton services prevent memory leaks
- Proper cleanup of event listeners
- Efficient state updates with minimal re-renders

### UI Performance
- Optimized animations with native driver
- Efficient list rendering with FlatList
- Proper component memoization

## Error Handling

### Service Level
- Graceful degradation on permission failures
- Automatic retry mechanisms for transient errors
- Comprehensive error logging

### Component Level
- User-friendly error messages
- Fallback UI states
- Proper loading states

### System Level
- App state change handling
- Audio session interruption recovery
- Background task management

## Testing Strategy

### Unit Tests
- Service method testing with mocked dependencies
- Component behavior testing
- State management testing

### Integration Tests
- Service interaction testing
- Navigation flow testing
- Audio recording/playback testing

### E2E Tests
- Complete user journey testing
- Cross-platform compatibility testing
- Performance testing

## Security Considerations

### Permissions
- Minimal required permissions
- Runtime permission requests
- Graceful permission denial handling

### Data Privacy
- Local storage only (no cloud sync)
- No data collection or analytics
- Secure file handling

### Audio Security
- No audio data transmission
- Local file encryption (if needed)
- Secure file deletion

## Future Enhancements

### Features
- Cloud storage integration
- Audio editing capabilities
- Sharing and collaboration
- Advanced audio analysis

### Performance
- Real-time audio analysis
- Advanced compression
- Background processing optimization

### UI/UX
- Dark mode support
- Accessibility improvements
- Advanced waveform features
- Custom themes
