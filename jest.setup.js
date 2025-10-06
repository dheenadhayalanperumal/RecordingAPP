/**
 * Jest Setup File
 * 
 * This file sets up global mocks and configurations for Jest tests.
 * It runs before each test file to ensure consistent testing environment.
 */

import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Rect: 'Rect',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
  Path: 'Path',
  Circle: 'Circle',
  G: 'G',
}));

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => 'Slider');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useFocusEffect: (callback) => callback(),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
}));

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    Recording: jest.fn(),
    Sound: {
      createAsync: jest.fn(),
    },
    RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4: 'mpeg_4',
    RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC: 'aac',
    RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC: 'mp4',
    RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH: 'high',
    INTERRUPTION_MODE_IOS_DO_NOT_MIX: 'do_not_mix',
    INTERRUPTION_MODE_ANDROID_DO_NOT_MIX: 'do_not_mix',
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file://test-documents/',
  cacheDirectory: 'file://test-cache/',
  getInfoAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  copyAsync: jest.fn(),
}));

// Mock expo-media-library
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(),
  createAssetAsync: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock react-native Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock react-native AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock react-native Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((obj) => obj.ios),
}));

// Mock react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Global test helpers
global.testUtils = {
  // Helper to create mock recording
  createMockRecording: (overrides = {}) => ({
    id: 'test-id',
    name: 'Test Recording',
    uri: 'file://test.mp4',
    duration: 120,
    createdAt: new Date(),
    ...overrides,
  }),
  
  // Helper to create mock playback state
  createMockPlaybackState: (overrides = {}) => ({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    currentRecording: null,
    ...overrides,
  }),
  
  // Helper to create mock recording state
  createMockRecordingState: (overrides = {}) => ({
    isRecording: false,
    isPaused: false,
    duration: 0,
    uri: null,
    name: '',
    ...overrides,
  }),
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
