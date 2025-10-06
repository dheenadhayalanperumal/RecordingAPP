/**
 * AudioRecorderService - Core Audio Recording Management
 * 
 * This service handles all aspects of audio recording including:
 * - Starting, pausing, resuming, and stopping recordings
 * - Managing recording state and persistence
 * - Handling file storage and retrieval
 * - Managing permissions and audio mode configuration
 * - Providing real-time recording state updates
 * 
 * The service uses a singleton pattern to ensure consistent state
 * across the entire application and provides comprehensive error
 * handling and recovery mechanisms.
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * RecordingState - Current state of the recording session
 * 
 * This interface represents the real-time state of the audio recording,
 * including whether recording is active, paused, duration, and file information.
 */
export interface RecordingState {
  isRecording: boolean;    // Whether currently recording audio
  isPaused: boolean;       // Whether recording is paused (but still active)
  duration: number;        // Current recording duration in seconds
  uri: string | null;      // File URI of the current recording
  name: string;           // Display name of the current recording
}

/**
 * SavedRecording - Persisted recording metadata
 * 
 * This interface represents a saved recording with all necessary
 * metadata for playback, management, and display purposes.
 */
export interface SavedRecording {
  id: string;             // Unique identifier for the recording
  name: string;           // User-friendly name for the recording
  uri: string;            // File system URI where the audio is stored
  duration: number;       // Total duration of the recording in seconds
  createdAt: Date;        // Timestamp when the recording was created
}

/**
 * AudioRecorderService - Main service class for audio recording management
 * 
 * This class implements the singleton pattern to provide a single instance
 * of the audio recorder service throughout the application. It manages the
 * complete lifecycle of audio recordings from initialization to cleanup.
 */
class AudioRecorderService {
  // Core recording object from expo-av
  private recording: Audio.Recording | null = null;
  
  // Current recording state - tracks real-time recording information
  private recordingState: RecordingState = {
    isRecording: false,    // Whether we're currently recording
    isPaused: false,       // Whether recording is paused
    duration: 0,          // Current recording duration in seconds
    uri: null,            // File URI of the current recording
    name: '',             // Display name of the current recording
  };
  
  // Timer for tracking recording duration
  private durationInterval: NodeJS.Timeout | null = null;
  
  // Timing information for accurate duration calculation
  private startTime: number = 0;        // When recording started (timestamp)
  private pausedDuration: number = 0;   // Total time spent paused
  
  // Event listeners for state changes
  private listeners: ((state: RecordingState) => void)[] = [];

  /**
   * Constructor - Initializes the service and sets up audio mode
   * 
   * The constructor automatically initializes the audio system to ensure
   * the service is ready for recording operations immediately.
   */
  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      // Set audio mode for recording with proper microphone access
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        // Ensure microphone is active
      });
      console.log('Audio mode initialized successfully for recording');
    } catch (error) {
      console.log('Failed with full config, trying minimal config...');
      try {
        // Fallback to minimal configuration
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        console.log('Audio mode initialized with minimal config');
      } catch (minimalError) {
        console.error('Failed to initialize audio with any config:', minimalError);
      }
    }
  }

  public addStateListener(listener: (state: RecordingState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.recordingState));
  }

  private updateState(updates: Partial<RecordingState>) {
    this.recordingState = { ...this.recordingState, ...updates };
    this.notifyListeners();
  }

  private startDurationTimer() {
    this.startTime = Date.now();
    this.durationInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime + this.pausedDuration;
      this.updateState({ duration: Math.floor(elapsed / 1000) });
    }, 100);
  }

  private stopDurationTimer() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      console.log('Requesting audio permissions...');
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      console.log('Audio permission status:', audioStatus);
      
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      console.log('Media library permission status:', mediaStatus);
      
      if (audioStatus !== 'granted') {
        console.error('Audio permission not granted - recording will not work');
        return false;
      }
      
      if (mediaStatus !== 'granted') {
        console.warn('Media library permission not granted - recordings cannot be saved to gallery');
        // Don't return false here as we can still save to app directory
      }
      
      console.log('All required permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  public async startRecording(): Promise<boolean> {
    try {
      if (this.recordingState.isRecording) {
        return false;
      }

      // Ensure audio mode is set before recording
      await this.initializeAudio();
      
      // Small delay to ensure audio mode is properly set
      await new Promise(resolve => setTimeout(resolve, 100));

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // Create recording URI with MP4 format for better iOS compatibility
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `recording_${timestamp}.mp4`;
      const uri = Platform.OS === 'ios' 
        ? `${FileSystem.documentDirectory}${fileName}`
        : `${FileSystem.documentDirectory}${fileName}`;
      
      console.log('Creating MP4 recording with URI:', uri);

      // Configure recording options for MP4 format (better iOS compatibility)
      const recordingOptions = {
        android: {
          extension: '.mp4',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4 || 'mpeg_4',
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC || 'aac',
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for better compatibility
          bitRate: 128000,
        },
        ios: {
          extension: '.mp4',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC || 'mp4',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH || 'high',
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for better compatibility
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/mp4',
          bitsPerSecond: 128000,
        },
      };

      // Clean up any existing recording object first
      await this.globalCleanup();

      this.recording = new Audio.Recording();
      console.log('Created new recording object:', !!this.recording);
      console.log('Preparing to record with options:', recordingOptions);
      
      try {
        // Use default options for better compatibility and to avoid conflicts
        await this.recording.prepareToRecordAsync();
        console.log('Recording prepared with default options');
      } catch (prepareError) {
        console.log('Prepare failed, performing emergency reset:', prepareError.message);
        await this.emergencyReset();
        
        // Try again with a fresh recording object
        this.recording = new Audio.Recording();
        try {
          await this.recording.prepareToRecordAsync();
          console.log('Recording prepared after emergency reset');
        } catch (secondPrepareError) {
          console.log('Second prepare failed, performing nuclear reset:', secondPrepareError.message);
          await this.nuclearReset();
          
          // Final attempt with nuclear reset
          this.recording = new Audio.Recording();
          await this.recording.prepareToRecordAsync();
          console.log('Recording prepared after nuclear reset');
        }
      }
      
      console.log('Recording object after prepare:', !!this.recording);
      
      console.log('Starting recording...');
      await this.recording.startAsync();
      console.log('Recording started successfully');
      console.log('Recording object after start:', !!this.recording);

      // Reset paused duration for new recording
      this.pausedDuration = 0;

      this.updateState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        uri,
        name: fileName,
      });

      this.startDurationTimer();
      await this.saveRecordingState();
      
      console.log('Recording state updated:', this.recordingState);
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  public async pauseRecording(): Promise<boolean> {
    try {
      console.log('Attempting to pause recording...');
      console.log('Recording object exists:', !!this.recording);
      console.log('Recording object type:', typeof this.recording);
      console.log('Recording object value:', this.recording);
      console.log('Is recording:', this.recordingState.isRecording);
      console.log('Is paused:', this.recordingState.isPaused);
      
      if (!this.recording || !this.recordingState.isRecording || this.recordingState.isPaused) {
        console.log('Cannot pause recording - conditions not met');
        return false;
      }

      await this.recording.pauseAsync();
      this.stopDurationTimer();
      this.pausedDuration += Date.now() - this.startTime;

      this.updateState({ isPaused: true });
      await this.saveRecordingState();
      console.log('Recording paused successfully');
      return true;
    } catch (error) {
      console.error('Failed to pause recording:', error);
      return false;
    }
  }

  public async resumeRecording(): Promise<boolean> {
    try {
      console.log('Attempting to resume recording...');
      console.log('Recording object exists:', !!this.recording);
      console.log('Is recording:', this.recordingState.isRecording);
      console.log('Is paused:', this.recordingState.isPaused);
      
      if (!this.recording || !this.recordingState.isRecording || !this.recordingState.isPaused) {
        console.log('Cannot resume recording - conditions not met');
        return false;
      }

      await this.recording.startAsync();
      this.startDurationTimer();

      this.updateState({ isPaused: false });
      await this.saveRecordingState();
      console.log('Recording resumed successfully');
      return true;
    } catch (error) {
      console.error('Failed to resume recording:', error);
      return false;
    }
  }

  public async stopRecording(): Promise<SavedRecording | null> {
    try {
      console.log('Attempting to stop recording...');
      console.log('Recording object exists:', !!this.recording);
      console.log('Recording object type:', typeof this.recording);
      console.log('Recording object value:', this.recording);
      console.log('Is recording:', this.recordingState.isRecording);
      
      if (!this.recording || !this.recordingState.isRecording) {
        console.log('Cannot stop recording - conditions not met');
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      this.stopDurationTimer();

      const uri = this.recording.getURI();
      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Check if the recording file has content
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('Recording file info:', fileInfo);
        if (fileInfo.size === 0) {
          console.warn('Recording file is empty - no audio captured');
        } else {
          console.log(`Recording file size: ${fileInfo.size} bytes`);
          if (fileInfo.size < 1000) {
            console.warn('Recording file is very small - may not contain valid audio');
          }
        }
      } catch (fileError) {
        console.log('File info check skipped (deprecated API):', fileError.message);
        // Skip file info check on iOS due to deprecated API
      }

      const savedRecording: SavedRecording = {
        id: Date.now().toString(),
        name: this.recordingState.name,
        uri,
        duration: this.recordingState.duration,
        createdAt: new Date(),
      };

      // Save to media library (optional, won't break recording if it fails)
      try {
        await this.saveToMediaLibrary(uri, savedRecording.name);
      } catch (mediaError) {
        console.log('Media library save failed (non-critical):', mediaError.message);
      }

      // Reset state
      this.recording = null;
      this.pausedDuration = 0;
      this.updateState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        uri: null,
        name: '',
      });

      await this.clearRecordingState();
      await this.saveRecording(savedRecording);
      return savedRecording;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  private async saveToMediaLibrary(uri: string, name: string): Promise<void> {
    try {
      // For iOS, we need to copy the file to a location that MediaLibrary can access
      if (Platform.OS === 'ios') {
        // Create a copy in the cache directory with a simpler path
        const cacheDir = FileSystem.cacheDirectory;
        const simpleFileName = `recording_${Date.now()}.mp4`;
        const newUri = `${cacheDir}${simpleFileName}`;
        
        // Copy the file to the new location
        await FileSystem.copyAsync({
          from: uri,
          to: newUri,
        });
        
        // Try to save the copied file
        const asset = await MediaLibrary.createAssetAsync(newUri);
        console.log('Recording saved to media library (iOS):', asset.id);
        
        // Clean up the copied file
        try {
          await FileSystem.deleteAsync(newUri);
        } catch (cleanupError) {
          console.log('Cleanup error (non-critical):', cleanupError.message);
        }
      } else {
        // For Android, use the original URI
        const asset = await MediaLibrary.createAssetAsync(uri);
        console.log('Recording saved to media library (Android):', asset.id);
      }
    } catch (error) {
      console.log('Failed to save to media library (non-critical):', error.message);
      // Don't throw error as this is not critical for the app functionality
    }
  }

  public async shareRecording(recording: SavedRecording): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.error('Sharing is not available on this platform');
        return false;
      }

      await Sharing.shareAsync(recording.uri, {
        mimeType: 'audio/mp4',
        dialogTitle: 'Share Recording',
      });

      return true;
    } catch (error) {
      console.error('Failed to share recording:', error);
      return false;
    }
  }

  public getCurrentState(): RecordingState {
    return { ...this.recordingState };
  }

  // State persistence methods
  private async saveRecordingState(): Promise<void> {
    try {
      await AsyncStorage.setItem('recordingState', JSON.stringify(this.recordingState));
    } catch (error) {
      console.error('Failed to save recording state:', error);
    }
  }

  private async loadRecordingState(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('recordingState');
      if (saved) {
        const state = JSON.parse(saved);
        console.log('Loading saved recording state:', state);
        this.recordingState = { ...this.recordingState, ...state };
        console.log('Updated recording state:', this.recordingState);
        this.notifyListeners();
      } else {
        console.log('No saved recording state found');
      }
    } catch (error) {
      console.error('Failed to load recording state:', error);
    }
  }

  private async clearRecordingState(): Promise<void> {
    try {
      await AsyncStorage.removeItem('recordingState');
    } catch (error) {
      console.error('Failed to clear recording state:', error);
    }
  }

  // Saved recordings management
  private async saveRecording(recording: SavedRecording): Promise<void> {
    try {
      const saved = await this.getSavedRecordings();
      saved.push(recording);
      await AsyncStorage.setItem('savedRecordings', JSON.stringify(saved));
    } catch (error) {
      console.error('Failed to save recording:', error);
    }
  }

  public async getSavedRecordings(): Promise<SavedRecording[]> {
    try {
      const saved = await AsyncStorage.getItem('savedRecordings');
      if (saved) {
        const recordings = JSON.parse(saved);
        return recordings.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get saved recordings:', error);
      return [];
    }
  }

  public async deleteRecording(id: string): Promise<boolean> {
    try {
      const recordings = await this.getSavedRecordings();
      const filtered = recordings.filter(r => r.id !== id);
      await AsyncStorage.setItem('savedRecordings', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete recording:', error);
      return false;
    }
  }

  // Handle app state changes and interruptions
  public async handleAppStateChange(nextAppState: string): Promise<void> {
    if (nextAppState === 'background' && this.recordingState.isRecording && !this.recordingState.isPaused) {
      // App is going to background, ensure recording continues
      console.log('App going to background, recording should continue');
    } else if (nextAppState === 'active' && this.recordingState.isRecording) {
      // App is coming to foreground, check if recording is still active
      console.log('App coming to foreground, checking recording state');
    }
  }

  public async handleInterruption(interruptionType: string): Promise<void> {
    console.log('Audio interruption:', interruptionType);
    
    if (this.recordingState.isRecording && !this.recordingState.isPaused) {
      // Automatically pause recording on interruption
      await this.pauseRecording();
    }
  }

  public async resumeAfterInterruption(): Promise<void> {
    if (this.recordingState.isRecording && this.recordingState.isPaused) {
      // Automatically resume recording after interruption
      await this.resumeRecording();
    }
  }

  // Test microphone access
  public async testMicrophone(): Promise<boolean> {
    try {
      console.log('Testing microphone access...');
      const testRecording = new Audio.Recording();
      await testRecording.prepareToRecordAsync();
      console.log('Microphone test successful - audio recording is available');
      
      // Properly clean up the test recording
      try {
        await testRecording.stopAndUnloadAsync();
        console.log('Test recording cleaned up successfully');
      } catch (cleanupError) {
        console.log('Test recording cleanup error (expected):', cleanupError.message);
        try {
          await testRecording.unloadAsync();
          console.log('Test recording unloaded successfully');
        } catch (unloadError) {
          console.log('Test recording unload error:', unloadError.message);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Microphone test failed:', error);
      return false;
    }
  }

  // Clean up any existing recording object
  private async cleanupRecording(): Promise<void> {
    if (this.recording) {
      try {
        console.log('Cleaning up existing recording object...');
        // Try to stop and unload the recording
        await this.recording.stopAndUnloadAsync();
        console.log('Recording object stopped and unloaded successfully');
      } catch (error) {
        console.log('Error during recording cleanup (expected if not active):', error.message);
        // Even if stopAndUnloadAsync fails, we still need to clear the object
        try {
          await this.recording.unloadAsync();
          console.log('Recording object unloaded successfully');
        } catch (unloadError) {
          console.log('Error during recording unload:', unloadError.message);
        }
      }
      this.recording = null;
      console.log('Recording object cleared');
      
      // Add a small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      console.log('No existing recording object to clean up');
    }
  }

  // Force reset the Audio module to clear any global recording state
  private async forceResetAudio(): Promise<void> {
    try {
      console.log('Force resetting Audio module...');
      // Reset audio mode to clear any global state
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio module reset successfully');
    } catch (error) {
      console.log('Error resetting Audio module:', error.message);
    }
  }

  // Global cleanup method to ensure all recording objects are disposed
  public async globalCleanup(): Promise<void> {
    console.log('Performing global recording cleanup...');
    await this.cleanupRecording();
    await this.forceResetAudio();
    console.log('Global cleanup completed successfully');
  }

  // Emergency reset method to completely clear all audio state
  public async emergencyReset(): Promise<void> {
    console.log('Performing emergency audio reset...');
    
    // Reset all state
    this.recording = null;
    this.recordingState = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      uri: null,
      name: '',
    };
    this.pausedDuration = 0;
    this.startTime = 0;
    
    // Clear any existing timers
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
    
    // Clear stored state
    await this.clearRecordingState();
    
    // Reset audio mode multiple times to ensure clean state
    await this.forceResetAudio();
    await new Promise(resolve => setTimeout(resolve, 500));
    await this.forceResetAudio();
    
    // Notify listeners of reset
    this.notifyListeners();
    
    console.log('Emergency reset completed');
  }

  // Nuclear option: completely reset the entire audio system
  public async nuclearReset(): Promise<void> {
    console.log('Performing nuclear audio reset...');
    
    // Complete state reset
    await this.emergencyReset();
    
    // Wait longer to ensure all async operations complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to create and immediately destroy a recording object to clear any global state
    try {
      const tempRecording = new Audio.Recording();
      await tempRecording.prepareToRecordAsync();
      await tempRecording.stopAndUnloadAsync();
      console.log('Nuclear reset: temporary recording cleared');
    } catch (error) {
      console.log('Nuclear reset: temporary recording error (expected):', error.message);
    }
    
    console.log('Nuclear reset completed');
  }

  // Clear any old recordings from cache and storage
  private async clearOldRecordings(): Promise<void> {
    try {
      console.log('Clearing old recordings...');
      
      // Clear old files from document directory
      const documentDir = FileSystem.documentDirectory;
      if (documentDir) {
        const files = await FileSystem.readDirectoryAsync(documentDir);
        for (const file of files) {
          if (file.endsWith('.m4a') || file.endsWith('.wav')) {
            try {
              await FileSystem.deleteAsync(`${documentDir}${file}`);
              console.log(`Deleted old file: ${file}`);
            } catch (deleteError) {
              console.log(`Could not delete ${file}:`, deleteError.message);
            }
          }
        }
      }
      
      // Clear any saved recordings with old formats from AsyncStorage
      try {
        const savedRecordings = await AsyncStorage.getItem('savedRecordings');
        if (savedRecordings) {
          const recordings = JSON.parse(savedRecordings);
          const filteredRecordings = recordings.filter((recording: any) => 
            !recording.uri || (!recording.uri.endsWith('.m4a') && !recording.uri.endsWith('.wav'))
          );
          
          if (filteredRecordings.length !== recordings.length) {
            await AsyncStorage.setItem('savedRecordings', JSON.stringify(filteredRecordings));
            console.log(`Cleared ${recordings.length - filteredRecordings.length} old recordings from storage`);
          }
        }
      } catch (storageError) {
        console.log('Error clearing old recordings from storage:', storageError.message);
      }
      
    } catch (error) {
      console.log('Error clearing old recordings:', error.message);
    }
  }

  // Clear all saved recordings to start fresh
  private async clearAllSavedRecordings(): Promise<void> {
    try {
      console.log('Clearing all saved recordings to start fresh...');
      await AsyncStorage.removeItem('savedRecordings');
      console.log('All saved recordings cleared');
    } catch (error) {
      console.log('Error clearing all saved recordings:', error.message);
    }
  }

  // Initialize service on app start
  public async initialize(): Promise<void> {
    await this.loadRecordingState();
    
    // Clear any old M4A recordings
    await this.clearOldRecordings();
    await this.clearAllSavedRecordings();
    
    // If state says we're recording but no recording object exists, reset state
    if (this.recordingState.isRecording && !this.recording) {
      console.log('State inconsistency detected: isRecording=true but no recording object. Resetting state.');
      this.recordingState = {
        isRecording: false,
        isPaused: false,
        duration: 0,
        uri: null,
        name: '',
      };
      await this.clearRecordingState();
      this.notifyListeners();
    }
    
    // Clean up any existing recording object on initialization
    await this.nuclearReset();
    
    // Note: Microphone test removed from initialization to prevent recording object conflicts
    // Microphone will be tested when actually starting a recording
  }
}

export default new AudioRecorderService();
