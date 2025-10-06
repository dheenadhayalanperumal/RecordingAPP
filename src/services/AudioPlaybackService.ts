import { Audio } from 'expo-av';
import { SavedRecording } from './AudioRecorderService';

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  currentRecording: SavedRecording | null;
}

class AudioPlaybackService {
  private sound: Audio.Sound | null = null;
  private playbackState: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    currentRecording: null,
  };
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private listeners: ((state: PlaybackState) => void)[] = [];

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio playback mode initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio for playback:', error);
    }
  }

  public addStateListener(listener: (state: PlaybackState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.playbackState));
  }

  private updateState(updates: Partial<PlaybackState>) {
    this.playbackState = { ...this.playbackState, ...updates };
    this.notifyListeners();
  }

  private startStatusUpdates() {
    this.statusUpdateInterval = setInterval(async () => {
      if (this.sound) {
        try {
          const status = await this.sound.getStatusAsync();
          if (status.isLoaded) {
            this.updateState({
              currentTime: Math.floor((status.positionMillis || 0) / 1000),
              duration: Math.floor((status.durationMillis || 0) / 1000),
            });
          }
        } catch (error) {
          console.error('Error getting playback status:', error);
        }
      }
    }, 100);
  }

  private stopStatusUpdates() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  public async loadRecording(recording: SavedRecording): Promise<boolean> {
    try {
      console.log('Loading recording for playback:', recording.uri);
      await this.stopPlayback();

      // Wait a moment to ensure any recording audio mode is cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Set audio mode for playback before loading
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('Audio mode set for playback');

      const { sound } = await Audio.Sound.createAsync(
        { uri: recording.uri },
        { shouldPlay: false },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.sound = sound;
      
      // Test if the sound is properly loaded
      const status = await sound.getStatusAsync();
      console.log('Sound status after loading:', status);
      
      if (status.isLoaded) {
        console.log('Recording loaded successfully for playback');
        console.log('Duration:', status.durationMillis, 'ms');
      } else {
        console.error('Sound failed to load properly');
        return false;
      }
      
      this.updateState({
        currentRecording: recording,
        currentTime: 0,
        duration: recording.duration,
      });

      return true;
    } catch (error) {
      console.error('Failed to load recording:', error);
      return false;
    }
  }

  public async play(): Promise<boolean> {
    try {
      if (!this.sound) {
        console.log('No sound object available for playback');
        return false;
      }

      console.log('Starting playback...');
      await this.sound.playAsync();
      console.log('Playback started successfully');
      
      this.updateState({
        isPlaying: true,
        isPaused: false,
      });

      this.startStatusUpdates();
      return true;
    } catch (error) {
      console.error('Failed to play recording:', error);
      return false;
    }
  }

  public async pause(): Promise<boolean> {
    try {
      if (!this.sound || !this.playbackState.isPlaying) {
        return false;
      }

      await this.sound.pauseAsync();
      this.updateState({
        isPlaying: false,
        isPaused: true,
      });

      this.stopStatusUpdates();
      return true;
    } catch (error) {
      console.error('Failed to pause recording:', error);
      return false;
    }
  }

  public async resume(): Promise<boolean> {
    try {
      if (!this.sound || !this.playbackState.isPaused) {
        return false;
      }

      await this.sound.playAsync();
      this.updateState({
        isPlaying: true,
        isPaused: false,
      });

      this.startStatusUpdates();
      return true;
    } catch (error) {
      console.error('Failed to resume recording:', error);
      return false;
    }
  }

  public async stopPlayback(): Promise<boolean> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.stopStatusUpdates();
      this.updateState({
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        duration: 0,
        currentRecording: null,
      });

      return true;
    } catch (error) {
      console.error('Failed to stop playback:', error);
      return false;
    }
  }

  public async seekTo(position: number): Promise<boolean> {
    try {
      if (!this.sound || !this.playbackState.currentRecording) {
        return false;
      }

      const positionMillis = position * 1000;
      await this.sound.setPositionAsync(positionMillis);
      this.updateState({ currentTime: position });
      return true;
    } catch (error) {
      console.error('Failed to seek:', error);
      return false;
    }
  }

  private onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        this.stopPlayback();
      }
    }
  }

  public getCurrentState(): PlaybackState {
    return { ...this.playbackState };
  }

  public async setVolume(volume: number): Promise<boolean> {
    try {
      if (!this.sound) {
        return false;
      }

      await this.sound.setVolumeAsync(volume);
      return true;
    } catch (error) {
      console.error('Failed to set volume:', error);
      return false;
    }
  }

  public async setPlaybackRate(rate: number): Promise<boolean> {
    try {
      if (!this.sound) {
        return false;
      }

      await this.sound.setRateAsync(rate, true);
      return true;
    } catch (error) {
      console.error('Failed to set playback rate:', error);
      return false;
    }
  }
}

export default new AudioPlaybackService();
