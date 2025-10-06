# Testing Guide - Audio Recorder App

## Overview

This document provides comprehensive testing instructions for the Audio Recorder App, including unit tests, integration tests, and testing best practices.

## Test Structure

### Test Files Organization

```
__tests__/
├── AudioRecorderService.test.ts    # Core recording service tests
├── AudioPlaybackService.test.ts    # Playback service tests
├── PlayerContext.test.tsx          # Context provider tests
└── Waveform.test.tsx              # Component tests

jest.config.js                      # Jest configuration
jest.setup.js                      # Test setup and mocks
scripts/
└── test-runner.js                 # Custom test runner script
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

### Using the Custom Test Runner

```bash
# Basic test run
node scripts/test-runner.js

# Run with coverage
node scripts/test-runner.js --coverage

# Run in watch mode
node scripts/test-runner.js --watch

# Run in CI mode (includes linting and type checking)
node scripts/test-runner.js --ci

# Run with verbose output
node scripts/test-runner.js --verbose

# Run with linting and type checking
node scripts/test-runner.js --lint --type-check
```

## Test Categories

### 1. Unit Tests

#### AudioRecorderService Tests
Tests the core recording functionality:

```typescript
describe('AudioRecorderService', () => {
  it('should start recording successfully', async () => {
    const result = await AudioRecorderService.startRecording();
    expect(result).toBe(true);
  });

  it('should handle recording start failure', async () => {
    // Mock permission denial
    mockAudio.requestPermissionsAsync.mockResolvedValue({
      status: 'denied',
      canAskAgain: false,
      expires: 'never',
    });
    
    const result = await AudioRecorderService.startRecording();
    expect(result).toBe(false);
  });
});
```

**Key Test Areas:**
- Recording lifecycle (start, pause, resume, stop)
- State management and persistence
- Permission handling
- Error scenarios and recovery
- File management operations

#### AudioPlaybackService Tests
Tests audio playback functionality:

```typescript
describe('AudioPlaybackService', () => {
  it('should load recording successfully', async () => {
    const result = await AudioPlaybackService.loadRecording(mockRecording);
    expect(result).toBe(true);
  });

  it('should handle playback controls', async () => {
    await AudioPlaybackService.play();
    expect(mockSound.playAsync).toHaveBeenCalled();
  });
});
```

**Key Test Areas:**
- Audio loading and playback
- Playback controls (play, pause, stop, seek)
- Volume and rate control
- State management
- Error handling

#### PlayerContext Tests
Tests the global player context:

```typescript
describe('PlayerContext', () => {
  it('should show global player when showGlobalPlayer is called', async () => {
    const { getByTestId } = render(
      <PlayerProvider>
        <TestComponent />
      </PlayerProvider>
    );

    await act(async () => {
      fireEvent.press(getByTestId('show-player'));
    });

    expect(getByTestId('player-visible').children[0]).toBe('visible');
  });
});
```

**Key Test Areas:**
- Context provider behavior
- State management
- Player visibility controls
- Error handling

#### Waveform Component Tests
Tests the waveform visualization:

```typescript
describe('Waveform Component', () => {
  it('should start audio analysis when recording starts', () => {
    const { rerender } = render(
      <Waveform isRecording={false} isPaused={false} duration={120} />
    );

    rerender(<Waveform isRecording={true} isPaused={false} duration={120} />);

    expect(mockAudioAnalysisService.startAnalysis).toHaveBeenCalled();
  });
});
```

**Key Test Areas:**
- Recording state visualization
- Playback progress display
- Audio analysis integration
- Animation behavior
- Error handling

### 2. Integration Tests

#### Service Integration Tests
Test how services work together:

```typescript
describe('Service Integration', () => {
  it('should handle recording to playback flow', async () => {
    // Start recording
    const recordingStarted = await AudioRecorderService.startRecording();
    expect(recordingStarted).toBe(true);

    // Stop recording
    const recording = await AudioRecorderService.stopRecording();
    expect(recording).toBeDefined();

    // Load for playback
    const playbackLoaded = await AudioPlaybackService.loadRecording(recording);
    expect(playbackLoaded).toBe(true);
  });
});
```

#### Component Integration Tests
Test component interactions:

```typescript
describe('Component Integration', () => {
  it('should update waveform when recording state changes', () => {
    const { rerender } = render(
      <RecordingControls onRecordingComplete={jest.fn()} />
    );

    // Simulate recording state change
    rerender(<RecordingControls onRecordingComplete={jest.fn()} />);

    // Verify waveform updates
    expect(mockAudioAnalysisService.startAnalysis).toHaveBeenCalled();
  });
});
```

### 3. End-to-End Tests

#### User Journey Tests
Test complete user workflows:

```typescript
describe('User Journey', () => {
  it('should complete full recording workflow', async () => {
    // 1. Start recording
    await AudioRecorderService.startRecording();
    
    // 2. Pause recording
    await AudioRecorderService.pauseRecording();
    
    // 3. Resume recording
    await AudioRecorderService.resumeRecording();
    
    // 4. Stop recording
    const recording = await AudioRecorderService.stopRecording();
    
    // 5. Play recording
    await AudioPlaybackService.loadRecording(recording);
    await AudioPlaybackService.play();
    
    // 6. Stop playback
    await AudioPlaybackService.stopPlayback();
  });
});
```

## Mocking Strategy

### Service Mocks
Mock external dependencies:

```typescript
// Mock expo-av
jest.mock('expo-av');
const mockAudio = Audio as jest.Mocked<typeof Audio>;

// Mock file system
jest.mock('expo-file-system/legacy');
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

// Mock async storage
jest.mock('@react-native-async-storage/async-storage');
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
```

### Component Mocks
Mock React Native components:

```typescript
// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Rect: 'Rect',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useFocusEffect: (callback) => callback(),
}));
```

### Test Utilities
Create reusable test utilities:

```typescript
// Global test helpers
global.testUtils = {
  createMockRecording: (overrides = {}) => ({
    id: 'test-id',
    name: 'Test Recording',
    uri: 'file://test.mp4',
    duration: 120,
    createdAt: new Date(),
    ...overrides,
  }),
  
  createMockPlaybackState: (overrides = {}) => ({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    currentRecording: null,
    ...overrides,
  }),
};
```

## Test Coverage

### Coverage Goals
- **Statements**: 70%+
- **Branches**: 70%+
- **Functions**: 70%+
- **Lines**: 70%+

### Coverage Reports
Generate coverage reports:

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration
Configure coverage in `jest.config.js`:

```javascript
collectCoverage: true,
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/**/*.d.ts',
  '!src/**/*.stories.{ts,tsx}',
  '!src/**/index.{ts,tsx}',
],
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
},
```

## Testing Best Practices

### 1. Test Structure
Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it('should do something', () => {
  // Arrange - Set up test data and mocks
  const mockData = { id: 'test', name: 'Test' };
  mockService.getData.mockResolvedValue(mockData);

  // Act - Execute the code under test
  const result = await serviceUnderTest.doSomething();

  // Assert - Verify the results
  expect(result).toBeDefined();
  expect(mockService.getData).toHaveBeenCalled();
});
```

### 2. Mock Management
- Reset mocks between tests
- Use specific mock implementations
- Verify mock calls and parameters

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Reset service state
  (AudioRecorderService as any).recording = null;
});
```

### 3. Async Testing
Handle async operations properly:

```typescript
it('should handle async operations', async () => {
  const promise = serviceUnderTest.asyncOperation();
  
  // Use act() for state updates
  await act(async () => {
    await promise;
  });
  
  expect(result).toBeDefined();
});
```

### 4. Error Testing
Test error scenarios:

```typescript
it('should handle errors gracefully', async () => {
  mockService.operation.mockRejectedValue(new Error('Test error'));
  
  const result = await serviceUnderTest.operation();
  
  expect(result).toBe(false);
  expect(console.error).toHaveBeenCalled();
});
```

### 5. Component Testing
Test component behavior, not implementation:

```typescript
it('should call onPress when button is pressed', () => {
  const onPress = jest.fn();
  const { getByTestId } = render(<Button onPress={onPress} />);
  
  fireEvent.press(getByTestId('button'));
  
  expect(onPress).toHaveBeenCalled();
});
```

## Continuous Integration

### GitHub Actions
Set up CI/CD pipeline:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

### Pre-commit Hooks
Add pre-commit testing:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:ci && npm run lint"
    }
  }
}
```

## Debugging Tests

### Debug Mode
Run tests in debug mode:

```bash
# Debug specific test
npm test -- --testNamePattern="should start recording"

# Debug with verbose output
npm test -- --verbose

# Debug specific file
npm test -- AudioRecorderService.test.ts
```

### Test Debugging Tips
1. Use `console.log` for debugging
2. Check mock implementations
3. Verify test data setup
4. Use `--verbose` flag for detailed output
5. Check coverage reports for untested code

## Performance Testing

### Test Performance
Monitor test execution time:

```bash
# Run tests with timing
npm test -- --verbose

# Profile test performance
npm test -- --detectOpenHandles --forceExit
```

### Memory Leaks
Check for memory leaks:

```bash
# Run tests with memory monitoring
npm test -- --detectLeaks --detectOpenHandles
```

## Troubleshooting

### Common Issues

#### 1. Mock Not Working
```typescript
// Ensure mocks are properly set up
jest.mock('expo-av');
const mockAudio = Audio as jest.Mocked<typeof Audio>;
```

#### 2. Async Test Failures
```typescript
// Use proper async/await
it('should handle async', async () => {
  await expect(asyncFunction()).resolves.toBeDefined();
});
```

#### 3. Component Not Rendering
```typescript
// Check component dependencies
import { render } from '@testing-library/react-native';
import { PlayerProvider } from '../src/context/PlayerContext';
```

#### 4. Timer Issues
```typescript
// Use fake timers for timer-dependent tests
jest.useFakeTimers();
// ... test code ...
jest.runAllTimers();
```

### Getting Help
1. Check Jest documentation
2. Review test examples in the codebase
3. Use debugging tools
4. Check mock implementations
5. Verify test setup

## Conclusion

This testing guide provides comprehensive coverage of testing strategies for the Audio Recorder App. Follow these practices to ensure code quality, reliability, and maintainability.

For additional help or questions, refer to the Jest documentation or the project's API documentation.
