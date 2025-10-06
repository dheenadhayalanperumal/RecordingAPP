# Audio Recorder - React Native App

A comprehensive React Native audio recording application built with Expo that supports background recording, interruption handling, and state persistence.

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Studio

### Quick Setup
```bash
# Clone and install
git clone <repository-url>
cd RecordingAPP
npm install

# Start development server
npx expo start

# Run on iOS (press 'i' in terminal)
npm run ios

# Run on Android (press 'a' in terminal)
npm run android
```

### Physical Device Testing
1. Install **Expo Go** from App Store/Play Store
2. Scan QR code from terminal/browser
3. Grant microphone and media library permissions

> **Note**: For full functionality including background recording, test on physical devices.

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

#### System Requirements
- **Node.js**: v16 or higher ([Download here](https://nodejs.org/))
- **npm**: v8 or higher (comes with Node.js)
- **Git**: For cloning the repository

#### Platform-Specific Requirements

##### For iOS Development
- **macOS**: Required for iOS development
- **Xcode**: Latest version from Mac App Store
- **iOS Simulator**: Comes with Xcode
- **CocoaPods**: `sudo gem install cocoapods` (if using bare React Native)

##### For Android Development
- **Android Studio**: Latest version ([Download here](https://developer.android.com/studio))
- **Android SDK**: API level 33 or higher
- **Android Emulator**: Set up through Android Studio
- **Java Development Kit (JDK)**: v11 or higher

#### Global Dependencies
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify installation
expo --version
```

### Setup Instructions

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd RecordingAPP
```

#### 2. Install Project Dependencies
```bash
# Install all dependencies
npm install

# Install iOS dependencies (if using bare React Native)
cd ios && pod install && cd ..
```

#### 3. Environment Setup

##### iOS Setup
1. **Open Xcode** and accept license agreements
2. **Install iOS Simulator**:
   - Open Xcode → Preferences → Components
   - Download latest iOS Simulator
3. **Verify iOS setup**:
   ```bash
   xcrun simctl list devices
   ```

##### Android Setup
1. **Install Android Studio** and follow setup wizard
2. **Configure Android SDK**:
   - Open Android Studio → SDK Manager
   - Install Android SDK Platform 33+
   - Install Android SDK Build-Tools
3. **Set up Android Emulator**:
   - Open Android Studio → AVD Manager
   - Create new Virtual Device
   - Choose device (e.g., Pixel 6) and API level 33+
4. **Set environment variables** (add to your shell profile):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Running the App

### Development Server
Start the Expo development server:
```bash
npx expo start
```

This will open the Expo DevTools in your browser and show a QR code.

### iOS Instructions

#### Option 1: iOS Simulator (Recommended for Development)
```bash
# Start iOS simulator
npm run ios

# Or press 'i' in the Expo CLI terminal
```

**Manual Steps:**
1. Open **iOS Simulator** from Xcode or Spotlight
2. In Expo DevTools, click **"Run on iOS simulator"**
3. Wait for the app to build and install
4. The app will automatically launch in the simulator

#### Option 2: Physical iOS Device
1. **Install Expo Go** from the App Store
2. **Connect device** to the same WiFi network as your computer
3. **Scan QR code** with your device camera or Expo Go app
4. **Allow permissions** when prompted (microphone, media library)

#### iOS-Specific Notes
- **Background Recording**: Works automatically with proper permissions
- **Microphone Access**: Grant permission when prompted
- **Media Library**: Allow access to save recordings
- **Silent Mode**: App works even when device is in silent mode

### Android Instructions

#### Option 1: Android Emulator (Recommended for Development)
```bash
# Start Android emulator
npm run android

# Or press 'a' in the Expo CLI terminal
```

**Manual Steps:**
1. **Start Android Emulator** from Android Studio AVD Manager
2. In Expo DevTools, click **"Run on Android device/emulator"**
3. Wait for the app to build and install
4. The app will automatically launch in the emulator

#### Option 2: Physical Android Device
1. **Install Expo Go** from Google Play Store
2. **Enable Developer Options**:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"
3. **Connect device** via USB or same WiFi network
4. **Scan QR code** with Expo Go app
5. **Grant permissions** when prompted

#### Android-Specific Notes
- **USB Debugging**: Required for physical device testing
- **Battery Optimization**: Disable for the app to allow background recording
- **Storage Permissions**: Grant access for file operations
- **Microphone Permissions**: Essential for recording functionality

### Web (Limited Functionality)
```bash
# Run on web browser
npm run web

# Or press 'w' in the Expo CLI terminal
```

**Note**: Web version has limited functionality due to browser restrictions on microphone access and file system operations.

### Troubleshooting Running Issues

#### Common iOS Issues
```bash
# Reset iOS Simulator
xcrun simctl erase all

# Clear Expo cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Common Android Issues
```bash
# Clear Android build cache
cd android && ./gradlew clean && cd ..

# Reset Android Emulator
# In Android Studio: AVD Manager → Wipe Data

# Check ADB connection
adb devices
```

#### Permission Issues
- **iOS**: Go to Settings → Privacy & Security → Microphone → Enable for your app
- **Android**: Go to Settings → Apps → Your App → Permissions → Enable all required permissions

### Development Workflow

#### Hot Reloading
- **Automatic**: Changes to code automatically reload the app
- **Manual Refresh**: Shake device or press `r` in terminal
- **Reload**: Press `R` in terminal for full reload

#### Debugging
```bash
# Enable debug mode
npx expo start --dev-client

# Open React Native debugger
# Press 'j' in terminal to open debugger
```

#### Testing on Multiple Devices
```bash
# Run on multiple platforms simultaneously
npx expo start --ios --android

# Tunnel mode (for testing on devices not on same network)
npx expo start --tunnel
```

### Testing the App

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

#### Manual Testing Checklist

##### Basic Functionality
- [ ] App launches without errors
- [ ] Recording starts when microphone button is pressed
- [ ] Timer displays correctly during recording
- [ ] Pause/resume functionality works
- [ ] Stop recording saves the file
- [ ] Recordings appear in the list
- [ ] Playback works for saved recordings

##### Platform-Specific Testing
- [ ] **iOS**: Background recording continues when app is minimized
- [ ] **iOS**: Recording pauses during phone calls
- [ ] **Android**: Background recording with battery optimization disabled
- [ ] **Android**: Proper permission handling
- [ ] **Both**: Microphone access works in silent mode

##### Edge Cases
- [ ] App handles microphone permission denial gracefully
- [ ] Recording continues after app interruption
- [ ] File sharing works correctly
- [ ] App recovers from crashes during recording

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



## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs
3. Create an issue in the repository
4. Contact the development team

---

**Note**: This app requires physical device testing for full functionality, especially background recording and interruption handling features.
