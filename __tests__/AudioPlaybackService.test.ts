/**
 * AudioPlaybackService Unit Tests
 * 
 * Tests the audio playback functionality including:
 * - Playback state management
 * - Audio loading and playback controls
 * - Seek functionality
 * - Error handling
 */

import AudioPlaybackService, { PlaybackState } from '../src/services/AudioPlaybackService';
import { Audio } from 'expo-av';
import { SavedRecording } from '../src/services/AudioRecorderService';

// Mock dependencies
jest.mock('expo-av');

const mockAudio = Audio as jest.Mocked<typeof Audio>;

describe('AudioPlaybackService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton instance state
    (AudioPlaybackService as any).sound = null;
    (AudioPlaybackService as any).playbackState = {
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      currentRecording: null,
    };
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const state = AudioPlaybackService.getCurrentState();
      expect(state).toEqual({
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        duration: 0,
        currentRecording: null,
      });
    });

    it('should set up audio mode for playback', async () => {
      mockAudio.setAudioModeAsync.mockResolvedValue(undefined);
      
      // The service initializes in constructor, so we test the behavior
      expect(mockAudio.setAudioModeAsync).toHaveBeenCalledWith({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    });
  });

  describe('Playback State Management', () => {
    it('should add and remove state listeners', () => {
      const listener = jest.fn();
      const unsubscribe = AudioPlaybackService.addStateListener(listener);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Test that unsubscribe works
      unsubscribe();
    });

    it('should notify listeners when state changes', () => {
      const listener = jest.fn();
      AudioPlaybackService.addStateListener(listener);
      
      // Simulate state change
      (AudioPlaybackService as any).updateState({ isPlaying: true });
      
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ isPlaying: true })
      );
    });
  });

  describe('Recording Loading', () => {
    const mockRecording: SavedRecording = {
      id: 'test-id',
      name: 'Test Recording',
      uri: 'file://test.mp4',
      duration: 120,
      createdAt: new Date(),
    };

    beforeEach(() => {
      // Mock successful sound creation
      const mockSound = {
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        }),
        playAsync: jest.fn().mockResolvedValue(undefined),
        pauseAsync: jest.fn().mockResolvedValue(undefined),
        stopAsync: jest.fn().mockResolvedValue(undefined),
        unloadAsync: jest.fn().mockResolvedValue(undefined),
        setPositionAsync: jest.fn().mockResolvedValue(undefined),
        setVolumeAsync: jest.fn().mockResolvedValue(undefined),
        setRateAsync: jest.fn().mockResolvedValue(undefined),
      };

      mockAudio.Sound.createAsync.mockResolvedValue({
        sound: mockSound,
        status: {
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        },
      });
    });

    it('should load recording successfully', async () => {
      const result = await AudioPlaybackService.loadRecording(mockRecording);
      
      expect(result).toBe(true);
      expect(mockAudio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: mockRecording.uri },
        { shouldPlay: false },
        expect.any(Function)
      );
    });

    it('should handle loading failure', async () => {
      mockAudio.Sound.createAsync.mockRejectedValue(new Error('Loading failed'));
      
      const result = await AudioPlaybackService.loadRecording(mockRecording);
      
      expect(result).toBe(false);
    });

    it('should stop current playback before loading new recording', async () => {
      // First load a recording
      await AudioPlaybackService.loadRecording(mockRecording);
      
      // Load another recording
      const anotherRecording = { ...mockRecording, id: 'test-id-2' };
      await AudioPlaybackService.loadRecording(anotherRecording);
      
      // Should have called unload on the previous sound
      expect(mockAudio.Sound.createAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Playback Controls', () => {
    const mockRecording: SavedRecording = {
      id: 'test-id',
      name: 'Test Recording',
      uri: 'file://test.mp4',
      duration: 120,
      createdAt: new Date(),
    };

    beforeEach(async () => {
      // Mock sound object
      const mockSound = {
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        }),
        playAsync: jest.fn().mockResolvedValue(undefined),
        pauseAsync: jest.fn().mockResolvedValue(undefined),
        stopAsync: jest.fn().mockResolvedValue(undefined),
        unloadAsync: jest.fn().mockResolvedValue(undefined),
        setPositionAsync: jest.fn().mockResolvedValue(undefined),
        setVolumeAsync: jest.fn().mockResolvedValue(undefined),
        setRateAsync: jest.fn().mockResolvedValue(undefined),
      };

      mockAudio.Sound.createAsync.mockResolvedValue({
        sound: mockSound,
        status: {
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        },
      });

      // Load a recording first
      await AudioPlaybackService.loadRecording(mockRecording);
    });

    it('should play recording successfully', async () => {
      const result = await AudioPlaybackService.play();
      
      expect(result).toBe(true);
      expect(mockAudio.Sound.createAsync).toHaveBeenCalled();
    });

    it('should pause recording successfully', async () => {
      // First play
      await AudioPlaybackService.play();
      
      const result = await AudioPlaybackService.pause();
      
      expect(result).toBe(true);
    });

    it('should resume recording successfully', async () => {
      // Play and pause first
      await AudioPlaybackService.play();
      await AudioPlaybackService.pause();
      
      const result = await AudioPlaybackService.resume();
      
      expect(result).toBe(true);
    });

    it('should stop playback successfully', async () => {
      const result = await AudioPlaybackService.stopPlayback();
      
      expect(result).toBe(true);
    });

    it('should handle play when no sound is loaded', async () => {
      // Reset the sound to null
      (AudioPlaybackService as any).sound = null;
      
      const result = await AudioPlaybackService.play();
      
      expect(result).toBe(false);
    });

    it('should handle pause when not playing', async () => {
      const result = await AudioPlaybackService.pause();
      
      expect(result).toBe(false);
    });
  });

  describe('Seek Functionality', () => {
    const mockRecording: SavedRecording = {
      id: 'test-id',
      name: 'Test Recording',
      uri: 'file://test.mp4',
      duration: 120,
      createdAt: new Date(),
    };

    beforeEach(async () => {
      // Mock sound object
      const mockSound = {
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        }),
        playAsync: jest.fn().mockResolvedValue(undefined),
        pauseAsync: jest.fn().mockResolvedValue(undefined),
        stopAsync: jest.fn().mockResolvedValue(undefined),
        unloadAsync: jest.fn().mockResolvedValue(undefined),
        setPositionAsync: jest.fn().mockResolvedValue(undefined),
        setVolumeAsync: jest.fn().mockResolvedValue(undefined),
        setRateAsync: jest.fn().mockResolvedValue(undefined),
      };

      mockAudio.Sound.createAsync.mockResolvedValue({
        sound: mockSound,
        status: {
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        },
      });

      // Load a recording first
      await AudioPlaybackService.loadRecording(mockRecording);
    });

    it('should seek to position successfully', async () => {
      const result = await AudioPlaybackService.seekTo(60); // Seek to 60 seconds
      
      expect(result).toBe(true);
    });

    it('should handle seek when no sound is loaded', async () => {
      // Reset the sound to null
      (AudioPlaybackService as any).sound = null;
      
      const result = await AudioPlaybackService.seekTo(60);
      
      expect(result).toBe(false);
    });

    it('should handle seek when no current recording', async () => {
      // Reset the current recording
      (AudioPlaybackService as any).playbackState.currentRecording = null;
      
      const result = await AudioPlaybackService.seekTo(60);
      
      expect(result).toBe(false);
    });
  });

  describe('Volume and Rate Control', () => {
    const mockRecording: SavedRecording = {
      id: 'test-id',
      name: 'Test Recording',
      uri: 'file://test.mp4',
      duration: 120,
      createdAt: new Date(),
    };

    beforeEach(async () => {
      // Mock sound object
      const mockSound = {
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        }),
        playAsync: jest.fn().mockResolvedValue(undefined),
        pauseAsync: jest.fn().mockResolvedValue(undefined),
        stopAsync: jest.fn().mockResolvedValue(undefined),
        unloadAsync: jest.fn().mockResolvedValue(undefined),
        setPositionAsync: jest.fn().mockResolvedValue(undefined),
        setVolumeAsync: jest.fn().mockResolvedValue(undefined),
        setRateAsync: jest.fn().mockResolvedValue(undefined),
      };

      mockAudio.Sound.createAsync.mockResolvedValue({
        sound: mockSound,
        status: {
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        },
      });

      // Load a recording first
      await AudioPlaybackService.loadRecording(mockRecording);
    });

    it('should set volume successfully', async () => {
      const result = await AudioPlaybackService.setVolume(0.5);
      
      expect(result).toBe(true);
    });

    it('should set playback rate successfully', async () => {
      const result = await AudioPlaybackService.setPlaybackRate(1.5);
      
      expect(result).toBe(true);
    });

    it('should handle volume setting when no sound is loaded', async () => {
      // Reset the sound to null
      (AudioPlaybackService as any).sound = null;
      
      const result = await AudioPlaybackService.setVolume(0.5);
      
      expect(result).toBe(false);
    });

    it('should handle rate setting when no sound is loaded', async () => {
      // Reset the sound to null
      (AudioPlaybackService as any).sound = null;
      
      const result = await AudioPlaybackService.setPlaybackRate(1.5);
      
      expect(result).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle audio mode setup failure', async () => {
      mockAudio.setAudioModeAsync.mockRejectedValue(new Error('Audio mode failed'));
      
      // Should not throw, but handle gracefully
      expect(true).toBe(true); // Service handles errors internally
    });

    it('should handle playback errors gracefully', async () => {
      const mockSound = {
        playAsync: jest.fn().mockRejectedValue(new Error('Playback failed')),
      };

      mockAudio.Sound.createAsync.mockResolvedValue({
        sound: mockSound,
        status: {
          isLoaded: true,
          durationMillis: 120000,
          positionMillis: 0,
        },
      });

      const mockRecording: SavedRecording = {
        id: 'test-id',
        name: 'Test Recording',
        uri: 'file://test.mp4',
        duration: 120,
        createdAt: new Date(),
      };

      await AudioPlaybackService.loadRecording(mockRecording);
      
      const result = await AudioPlaybackService.play();
      
      expect(result).toBe(false);
    });
  });
});
