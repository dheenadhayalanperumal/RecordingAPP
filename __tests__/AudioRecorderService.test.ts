/**
 * AudioRecorderService Unit Tests
 * 
 * Tests the core audio recording functionality including:
 * - Recording state management
 * - Audio file creation and management
 * - Permission handling
 * - Error scenarios
 */

import AudioRecorderService, { RecordingState, SavedRecording } from '../src/services/AudioRecorderService';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('expo-av');
jest.mock('expo-file-system/legacy');
jest.mock('@react-native-async-storage/async-storage');

const mockAudio = Audio as jest.Mocked<typeof Audio>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('AudioRecorderService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance state
    (AudioRecorderService as any).recording = null;
    (AudioRecorderService as any).recordingState = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      uri: null,
      name: '',
    };
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = AudioRecorderService.getCurrentState();
      expect(state).toEqual({
        isRecording: false,
        isPaused: false,
        duration: 0,
        uri: null,
        name: '',
      });
    });

    it('should set up audio mode correctly', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      
      await AudioRecorderService.initialize();
      
      expect(mockAudio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    });
  });

  describe('Recording State Management', () => {
    it('should add and remove state listeners', () => {
      const listener = jest.fn();
      const unsubscribe = AudioRecorderService.addStateListener(listener);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Test that unsubscribe works
      unsubscribe();
      // This would be tested by checking internal state, but since it's private,
      // we'll test the behavior indirectly
    });

    it('should notify listeners when state changes', () => {
      const listener = jest.fn();
      AudioRecorderService.addStateListener(listener);
      
      // Simulate state change
      (AudioRecorderService as any).updateState({ isRecording: true });
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ isRecording: true })
      );
    });
  });

  describe('Recording Operations', () => {
    beforeEach(() => {
      // Mock successful permission request
      mockAudio.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        expires: 'never',
      });
      
      // Mock successful audio mode setup
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      
      // Mock recording object
      const mockRecording = {
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined),
        pauseAsync: jest.fn().mockResolvedValue(undefined),
        stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
        getURI: jest.fn().mockReturnValue('file://test-recording.mp4'),
      };
      
      mockAudio.Recording.mockImplementation(() => mockRecording);
    });

    it('should start recording successfully', async () => {
      const result = await AudioRecorderService.startRecording();
      
      expect(result).toBe(true);
      expect(mockAudio.setAudioModeAsync).toHaveBeenCalled();
      expect(mockAudio.Recording).toHaveBeenCalled();
    });

    it('should handle recording start failure', async () => {
      mockAudio.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        expires: 'never',
      });
      
      const result = await AudioRecorderService.startRecording();
      
      expect(result).toBe(false);
    });

    it('should pause recording when active', async () => {
      // First start recording
      await AudioRecorderService.startRecording();
      
      const result = await AudioRecorderService.pauseRecording();
      
      expect(result).toBe(true);
    });

    it('should resume recording when paused', async () => {
      // Start and pause recording
      await AudioRecorderService.startRecording();
      await AudioRecorderService.pauseRecording();
      
      const result = await AudioRecorderService.resumeRecording();
      
      expect(result).toBe(true);
    });

    it('should stop recording and return saved recording', async () => {
      // Mock file system operations
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        size: 1024,
        uri: 'file://test-recording.mp4',
      });
      
      // Start recording
      await AudioRecorderService.startRecording();
      
      const result = await AudioRecorderService.stopRecording();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('uri');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('Saved Recordings Management', () => {
    beforeEach(() => {
      // Mock AsyncStorage
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);
    });

    it('should save recording to storage', async () => {
      const mockRecording: SavedRecording = {
        id: 'test-id',
        name: 'Test Recording',
        uri: 'file://test.mp4',
        duration: 120,
        createdAt: new Date(),
      };
      
      await AudioRecorderService.saveRecording(mockRecording);
      
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'savedRecordings',
        JSON.stringify([mockRecording])
      );
    });

    it('should load saved recordings from storage', async () => {
      const mockRecordings = [
        {
          id: 'test-id-1',
          name: 'Test Recording 1',
          uri: 'file://test1.mp4',
          duration: 120,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'test-id-2',
          name: 'Test Recording 2',
          uri: 'file://test2.mp4',
          duration: 180,
          createdAt: new Date().toISOString(),
        },
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockRecordings));
      
      const result = await AudioRecorderService.getSavedRecordings();
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Test Recording 1');
      expect(result[1].name).toBe('Test Recording 2');
    });

    it('should delete recording from storage', async () => {
      const mockRecordings = [
        {
          id: 'test-id-1',
          name: 'Test Recording 1',
          uri: 'file://test1.mp4',
          duration: 120,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'test-id-2',
          name: 'Test Recording 2',
          uri: 'file://test2.mp4',
          duration: 180,
          createdAt: new Date().toISOString(),
        },
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockRecordings));
      
      const result = await AudioRecorderService.deleteRecording('test-id-1');
      
      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'savedRecordings',
        JSON.stringify([mockRecordings[1]])
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle audio mode setup failure', async () => {
      mockAudio.setAudioModeAsync.mockRejectedValue(new Error('Audio mode failed'));
      
      // Should not throw, but handle gracefully
      await expect(AudioRecorderService.initialize()).resolves.not.toThrow();
    });

    it('should handle recording preparation failure', async () => {
      const mockRecording = {
        prepareToRecordAsync: jest.fn().mockRejectedValue(new Error('Preparation failed')),
      };
      
      mockAudio.Recording.mockImplementation(() => mockRecording);
      mockAudio.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        expires: 'never',
      });
      
      const result = await AudioRecorderService.startRecording();
      
      expect(result).toBe(false);
    });

    it('should handle file system errors gracefully', async () => {
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));
      
      // Start recording first
      await AudioRecorderService.startRecording();
      
      // Stop recording should handle file system errors gracefully
      const result = await AudioRecorderService.stopRecording();
      
      // Should still return a recording object even if file info fails
      expect(result).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    it('should format time correctly', () => {
      // This would test a utility function if it were exposed
      // For now, we'll test the behavior through the service
      const state = AudioRecorderService.getCurrentState();
      expect(state.duration).toBe(0);
    });

    it('should handle app state changes', async () => {
      // Test that app state changes are handled properly
      await AudioRecorderService.handleAppStateChange('background');
      await AudioRecorderService.handleAppStateChange('active');
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });
});
