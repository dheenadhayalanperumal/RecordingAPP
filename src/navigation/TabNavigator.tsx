import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RecordingScreen from '../screens/RecordingScreen';
import RecordingsScreen from '../screens/RecordingsScreen';
import { SavedRecording } from '../services/AudioRecorderService';
import AudioRecorderService from '../services/AudioRecorderService';

export type TabParamList = {
  Recording: undefined;
  Recordings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabNavigatorProps {
  onRecordingComplete?: (recording: SavedRecording) => void;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ onRecordingComplete }) => {
  const handleTabPress = async (routeName: string) => {
    if (routeName === 'Recordings') {
      // Sync recordings when Recordings tab is pressed
      try {
        console.log('Syncing recordings...');
        await AudioRecorderService.getSavedRecordings();
        console.log('Recordings synced successfully');
      } catch (error) {
        console.error('Failed to sync recordings:', error);
      }
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Recording') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'Recordings') {
            iconName = focused ? 'list' : 'list-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 20,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#333',
        },
      })}
      screenListeners={{
        tabPress: (e) => {
          const routeName = e.target?.split('-')[0];
          if (routeName) {
            handleTabPress(routeName);
          }
        },
      }}
    >
      <Tab.Screen 
        name="Recording" 
        options={{ 
          title: 'Record',
          headerTitle: 'Audio Recorder'
        }}
      >
        {() => <RecordingScreen onRecordingComplete={onRecordingComplete} />}
      </Tab.Screen>
      
      <Tab.Screen 
        name="Recordings" 
        options={{ 
          title: 'Recordings',
          headerTitle: 'My Recordings'
        }}
      >
        {() => <RecordingsScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;
