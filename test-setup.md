# Testing Setup Guide

## Quick Start Testing

1. **Install and Start**:
   ```bash
   npm install
   npx expo start
   ```

2. **Test on Device** (Recommended):
   - Install Expo Go app on your phone
   - Scan QR code from terminal
   - Test recording functionality

3. **Test on Simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## Test Scenarios Checklist

### ✅ Basic Recording Flow
- [ ] Start recording (tap mic button)
- [ ] Pause recording (tap pause button)
- [ ] Resume recording (tap play button)
- [ ] Stop recording (tap stop button)
- [ ] Verify recording appears in list

### ✅ Background Recording
- [ ] Start recording
- [ ] Switch to another app
- [ ] Return to app - recording should continue
- [ ] Lock device - recording should continue
- [ ] Unlock device - recording should still be active

### ✅ Interruption Handling
- [ ] Start recording
- [ ] Receive phone call - recording should pause
- [ ] End call - recording should resume automatically
- [ ] Test with other audio apps

### ✅ Playback Testing
- [ ] Tap recording in list
- [ ] Play/pause controls work
- [ ] Seek slider works
- [ ] Share button works
- [ ] Stop button works

### ✅ UI/UX Testing
- [ ] Timer displays correctly
- [ ] Waveform shows during recording
- [ ] Status indicators are accurate
- [ ] Buttons reflect current state
- [ ] Pull-to-refresh works

## Platform-Specific Testing

### iOS Testing
- [ ] Background audio permission granted
- [ ] Microphone permission granted
- [ ] Media library permission granted
- [ ] Background recording works
- [ ] Interruption handling works

### Android Testing
- [ ] All permissions granted
- [ ] Background service works
- [ ] Battery optimization disabled
- [ ] File storage works correctly

## Troubleshooting

### If Recording Doesn't Work:
1. Check microphone permissions
2. Ensure device isn't in silent mode
3. Restart the app
4. Check console for errors

### If Background Recording Stops:
1. Check iOS Background App Refresh
2. Disable Android battery optimization
3. Ensure all permissions are granted

### If Playback Doesn't Work:
1. Check if recording file exists
2. Verify audio format compatibility
3. Restart the app

## Performance Testing

- [ ] App starts quickly
- [ ] Recording starts immediately
- [ ] No memory leaks during long recordings
- [ ] Smooth UI interactions
- [ ] Proper cleanup on app close

## Data Integrity Testing

- [ ] No audio loss during pauses
- [ ] No audio loss during interruptions
- [ ] Recordings play back correctly
- [ ] File sizes are reasonable
- [ ] Metadata is accurate

---

**Note**: For best results, test on a physical device rather than simulator, especially for background recording and interruption handling features.
