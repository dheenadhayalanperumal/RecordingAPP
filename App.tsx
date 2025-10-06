import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  Alert,
  AppState,
  AppStateStatus,
  Platform,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import GlobalPlayer from './src/components/GlobalPlayer';
import { PlayerProvider, usePlayer } from './src/context/PlayerContext';
import AudioRecorderService, { SavedRecording } from './src/services/AudioRecorderService';
import AudioPlaybackService from './src/services/AudioPlaybackService';
import InterruptionService from './src/services/InterruptionService';

const AppContent: React.FC = () => {
  const { currentRecording, isGlobalPlayerVisible, hideGlobalPlayer } = usePlayer();

  useEffect(() => {
    initializeApp();
    
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Handle app state changes for interruption management
      InterruptionService.handleAppStateChange(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      await AudioRecorderService.initialize();
      // Initialize interruption handling service
      await InterruptionService.initialize();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please restart.');
    }
  };

  const handleRecordingComplete = async (recording: SavedRecording) => {
    // Recording completed - could add notification or other logic here
    console.log('Recording completed:', recording.name);
  };

  const handleSeek = (position: number) => {
    // Handle seek from global player
    console.log('Seek to:', position);
  };

  const handleClosePlayer = async () => {
    await hideGlobalPlayer();
  };

  const cleanup = async () => {
    try {
      await AudioPlaybackService.stopPlayback();
      await InterruptionService.cleanup();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <NavigationContainer>
        <TabNavigator onRecordingComplete={handleRecordingComplete} />
      </NavigationContainer>
      
      {isGlobalPlayerVisible && currentRecording && (
        <View style={styles.globalPlayerContainer}>
          <GlobalPlayer
            recording={currentRecording}
            onClose={handleClosePlayer}
            onSeek={handleSeek}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  globalPlayerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 80 : 75, // iOS has slightly different spacing
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 10,
  },
});
