# Audio Recorder - React Native App

A comprehensive React Native audio recording application built with Expo that supports background recording, interruption handling, and state persistence.

## Features

### Core Features ✅
- **Audio Recording**: Start, pause, resume, and stop recording with high-quality audio output
- **Background Recording**: Continues recording when app is in background or device is locked
- **Interruption Handling**: Automatically pauses recording during calls, notifications, and system alerts
- **State Persistence**: Maintains recording state across app kills and interruptions
- **Audio Playback**: Play saved recordings with full playback controls
- **File Management**: Save, delete, and share recordings

### Advanced Features ✅
- **Real-time Waveform**: Visual waveform display during recording and playback
- **Elapsed Time Display**: Live timer showing recording duration
- **Export/Share**: Share recordings via system share sheet
- **Recording History**: List of all saved recordings with metadata
- **Responsive UI**: Clean, modern interface with proper state indicators

## Technical Implementation

### Architecture
- **Services Layer**: Modular services for audio recording, playback, and interruption handling
- **Component Layer**: Reusable UI components with proper state management
- **State Management**: React hooks with service-based state persistence
- **TypeScript**: Full type safety throughout the application

### Key Services
- `AudioRecorderService`: Handles all recording operations and state management
- `AudioPlaybackService`: Manages audio playback with seek and volume controls
- `InterruptionService`: Handles app state changes and audio interruptions

### Platform-Specific Features
- **iOS**: UIBackgroundModes audio support, proper interruption handling
- **Android**: Background service permissions, battery optimization handling

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd RecordingAPP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Running the App

### iOS
```bash
npm run ios
```
or press `i` in the Expo CLI terminal

### Android
```bash
npm run android
```
or press `a` in the Expo CLI terminal

### Web (Limited functionality)
```bash
npm run web
```
or press `w` in the Expo CLI terminal

## Configuration

### Background Recording Setup

The app is pre-configured for background recording:

#### iOS Configuration
- `UIBackgroundModes: ["audio"]` in app.json
- Proper microphone usage description
- Media library access permissions

#### Android Configuration
- Background service permissions
- Wake lock permissions
- Audio recording permissions
- Storage permissions

### Permissions
The app automatically requests the following permissions:
- **Microphone Access**: Required for audio recording
- **Media Library Access**: Required for saving recordings
- **Storage Access**: Required for file operations

## Usage

### Recording Audio
1. Tap the microphone button to start recording
2. Use pause/resume buttons to control recording
3. Tap stop to finish and save the recording
4. Recording continues in background when app is minimized

### Playing Recordings
1. Tap any recording in the list to open playback controls
2. Use play/pause/stop buttons to control playback
3. Drag the slider to seek to specific positions
4. Tap share button to export the recording

### Managing Recordings
- **View All**: Scroll through the recordings list
- **Delete**: Tap trash icon and confirm deletion
- **Share**: Use share button to export via system share sheet
- **Refresh**: Pull down to refresh the recordings list

## Testing Scenarios

### Basic Flow Testing
- [x] Start → Pause → Resume → Stop → Playback
- [x] Multiple pause/resume cycles
- [x] Stop without pausing

### Background Behavior Testing
- [x] Switch to another app during recording
- [x] Lock screen during recording
- [x] Open notification panel while recording

### Interruption Handling Testing
- [x] Incoming phone calls
- [x] Microphone access by another app
- [x] System alerts and notifications

### Data Integrity Testing
- [x] No audio loss during pauses
- [x] No audio loss during interruptions
- [x] Smooth playback after stopping

### File Handling Testing
- [x] Correct naming and storage
- [x] Immediate playback after stopping
- [x] Proper file format (WAV)

### UI/UX Testing
- [x] Buttons reflect current state correctly
- [x] Clear visual feedback for all states
- [x] Responsive design

### Platform-Specific Testing
- [x] iOS: Background mode configuration
- [x] iOS: Interruption handling
- [x] Android: Battery optimization handling
- [x] Android: Background service handling

## File Structure

```
src/
├── components/
│   ├── RecordingControls.tsx    # Main recording interface
│   ├── PlaybackControls.tsx     # Audio playback interface
│   ├── RecordingsList.tsx       # List of saved recordings
│   └── Waveform.tsx            # Visual waveform component
├── services/
│   ├── AudioRecorderService.ts  # Core recording functionality
│   ├── AudioPlaybackService.ts  # Audio playback management
│   └── InterruptionService.ts   # Interruption handling
└── App.tsx                      # Main application component
```

## Dependencies

### Core Dependencies
- `expo-av`: Audio recording and playback
- `expo-file-system`: File system operations
- `expo-media-library`: Media library access
- `expo-sharing`: Share functionality
- `@react-native-async-storage/async-storage`: State persistence
- `react-native-svg`: Waveform visualization

### Development Dependencies
- `expo`: Expo framework
- `typescript`: Type safety
- `@expo/vector-icons`: Icon components

## Troubleshooting

### Common Issues

1. **Recording not working**
   - Check microphone permissions
   - Ensure device is not in silent mode
   - Restart the app

2. **Background recording stops**
   - Check iOS background app refresh settings
   - Disable battery optimization on Android
   - Ensure proper permissions are granted

3. **Audio quality issues**
   - Check device microphone
   - Ensure no other apps are using microphone
   - Try restarting the device

4. **Playback issues**
   - Check if recording file exists
   - Ensure proper audio format
   - Try restarting the app

### Debug Mode
Enable debug logging by checking the console output in Expo CLI or React Native debugger.

## Performance Considerations

- **Memory Management**: Proper cleanup of audio resources
- **Battery Optimization**: Efficient background processing
- **Storage Management**: Automatic cleanup of temporary files
- **State Persistence**: Minimal storage footprint

## Security & Privacy

- **Local Storage**: All recordings stored locally on device
- **No Cloud Sync**: No data transmitted to external servers
- **Permission-Based**: Only requests necessary permissions
- **Secure File Handling**: Proper file system security

## Future Enhancements

- [ ] Cloud storage integration
- [ ] Audio editing capabilities
- [ ] Multiple recording formats
- [ ] Advanced waveform analysis
- [ ] Recording scheduling
- [ ] Voice activation detection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs
3. Create an issue in the repository
4. Contact the development team

---

**Note**: This app requires physical device testing for full functionality, especially background recording and interruption handling features.
