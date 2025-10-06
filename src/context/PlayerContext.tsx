import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SavedRecording } from '../services/AudioRecorderService';
import AudioPlaybackService from '../services/AudioPlaybackService';

interface PlayerContextType {
  currentRecording: SavedRecording | null;
  setCurrentRecording: (recording: SavedRecording | null) => void;
  isGlobalPlayerVisible: boolean;
  setIsGlobalPlayerVisible: (visible: boolean) => void;
  showGlobalPlayer: (recording: SavedRecording) => void;
  hideGlobalPlayer: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentRecording, setCurrentRecording] = useState<SavedRecording | null>(null);
  const [isGlobalPlayerVisible, setIsGlobalPlayerVisible] = useState(false);

  const showGlobalPlayer = (recording: SavedRecording) => {
    setCurrentRecording(recording);
    setIsGlobalPlayerVisible(true);
  };

  const hideGlobalPlayer = async () => {
    // Stop playback when hiding the global player
    await AudioPlaybackService.stopPlayback();
    setIsGlobalPlayerVisible(false);
    setCurrentRecording(null);
  };

  const value: PlayerContextType = {
    currentRecording,
    setCurrentRecording,
    isGlobalPlayerVisible,
    setIsGlobalPlayerVisible,
    showGlobalPlayer,
    hideGlobalPlayer,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
