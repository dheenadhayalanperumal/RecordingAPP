import { AppState, AppStateStatus } from 'react-native';
import { Audio } from 'expo-av';
import AudioRecorderService from './AudioRecorderService';

export interface InterruptionEvent {
  type: 'call' | 'notification' | 'other_app' | 'system_alert' | 'app_background' | 'app_foreground';
  timestamp: Date;
  handled: boolean;
}

class InterruptionService {
  private appStateSubscription: any = null;
  private audioInterruptionSubscription: any = null;
  private interruptionHistory: InterruptionEvent[] = [];
  private listeners: ((event: InterruptionEvent) => void)[] = [];

  constructor() {
    this.initialize();
  }

  public async initialize() {
    await this.setupAppStateListener();
    await this.setupAudioInterruptionListener();
  }

  private async setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this));
  }

  private async setupAudioInterruptionListener() {
    this.audioInterruptionSubscription = Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
  }

  public handleAppStateChange(nextAppState: AppStateStatus) {
    const currentState = AppState.currentState;
    
    if (currentState === 'active' && nextAppState === 'background') {
      this.handleInterruption({
        type: 'app_background',
        timestamp: new Date(),
        handled: false,
      });
    } else if (currentState === 'background' && nextAppState === 'active') {
      this.handleInterruption({
        type: 'app_foreground',
        timestamp: new Date(),
        handled: false,
      });
    }

    // Notify the audio recorder service about app state changes
    AudioRecorderService.handleAppStateChange(nextAppState);
  }

  public addInterruptionListener(listener: (event: InterruptionEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(event: InterruptionEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  public async handleInterruption(event: InterruptionEvent): Promise<void> {
    console.log('Handling interruption:', event.type);
    
    // Add to history
    this.interruptionHistory.push(event);
    
    // Notify listeners
    this.notifyListeners(event);

    // Handle different types of interruptions
    switch (event.type) {
      case 'call':
      case 'notification':
      case 'other_app':
      case 'system_alert':
        await this.handleAudioInterruption();
        break;
      case 'app_background':
        await this.handleAppBackground();
        break;
      case 'app_foreground':
        await this.handleAppForeground();
        break;
    }

    event.handled = true;
  }

  private async handleAudioInterruption(): Promise<void> {
    const recordingState = AudioRecorderService.getCurrentState();
    
    if (recordingState.isRecording && !recordingState.isPaused) {
      console.log('Pausing recording due to audio interruption');
      await AudioRecorderService.pauseRecording();
    }
  }

  private async handleAppBackground(): Promise<void> {
    const recordingState = AudioRecorderService.getCurrentState();
    
    if (recordingState.isRecording) {
      console.log('App going to background, recording should continue');
      // Recording should continue in background due to UIBackgroundModes configuration
    }
  }

  private async handleAppForeground(): Promise<void> {
    const recordingState = AudioRecorderService.getCurrentState();
    
    if (recordingState.isRecording && recordingState.isPaused) {
      console.log('App coming to foreground, checking if recording should resume');
      // Optionally auto-resume if it was paused due to interruption
      // await AudioRecorderService.resumeRecording();
    }
  }

  public async resumeAfterInterruption(): Promise<void> {
    const recordingState = AudioRecorderService.getCurrentState();
    
    if (recordingState.isRecording && recordingState.isPaused) {
      console.log('Resuming recording after interruption');
      await AudioRecorderService.resumeRecording();
    }
  }

  public getInterruptionHistory(): InterruptionEvent[] {
    return [...this.interruptionHistory];
  }

  public clearInterruptionHistory(): void {
    this.interruptionHistory = [];
  }

  public async cleanup(): Promise<void> {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    if (this.audioInterruptionSubscription) {
      // Cleanup audio interruption subscription if needed
    }
  }

  // Simulate different types of interruptions for testing
  public async simulateInterruption(type: InterruptionEvent['type']): Promise<void> {
    await this.handleInterruption({
      type,
      timestamp: new Date(),
      handled: false,
    });
  }
}

export default new InterruptionService();
