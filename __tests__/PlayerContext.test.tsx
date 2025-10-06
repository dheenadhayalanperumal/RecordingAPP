/**
 * PlayerContext Unit Tests
 * 
 * Tests the global player context functionality including:
 * - Context provider behavior
 * - State management
 * - Player visibility controls
 * - Error handling
 */

import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import { PlayerProvider, usePlayer } from '../src/context/PlayerContext';
import AudioPlaybackService from '../src/services/AudioPlaybackService';
import { SavedRecording } from '../src/services/AudioRecorderService';

// Mock the AudioPlaybackService
jest.mock('../src/services/AudioPlaybackService');
const mockAudioPlaybackService = AudioPlaybackService as jest.Mocked<typeof AudioPlaybackService>;

// Test component that uses the context
const TestComponent: React.FC = () => {
  const {
    currentRecording,
    isGlobalPlayerVisible,
    showGlobalPlayer,
    hideGlobalPlayer,
  } = usePlayer();

  return (
    <>
      <div data-testid="current-recording">
        {currentRecording ? currentRecording.name : 'No recording'}
      </div>
      <div data-testid="player-visible">
        {isGlobalPlayerVisible ? 'visible' : 'hidden'}
      </div>
      <button
        data-testid="show-player"
        onPress={() => {
          const mockRecording: SavedRecording = {
            id: 'test-id',
            name: 'Test Recording',
            uri: 'file://test.mp4',
            duration: 120,
            createdAt: new Date(),
          };
          showGlobalPlayer(mockRecording);
        }}
      >
        Show Player
      </button>
      <button
        data-testid="hide-player"
        onPress={hideGlobalPlayer}
      >
        Hide Player
      </button>
    </>
  );
};

// Component that tests error handling
const TestComponentWithoutProvider: React.FC = () => {
  usePlayer();
  return <div>Should not render</div>;
};

describe('PlayerContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioPlaybackService.stopPlayback.mockResolvedValue(true);
  });

  describe('PlayerProvider', () => {
    it('should provide default context values', () => {
      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      expect(getByTestId('current-recording').children[0]).toBe('No recording');
      expect(getByTestId('player-visible').children[0]).toBe('hidden');
    });

    it('should show global player when showGlobalPlayer is called', async () => {
      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
      });

      expect(getByTestId('current-recording').children[0]).toBe('Test Recording');
      expect(getByTestId('player-visible').children[0]).toBe('visible');
    });

    it('should hide global player when hideGlobalPlayer is called', async () => {
      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      // First show the player
      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
      });

      expect(getByTestId('player-visible').children[0]).toBe('visible');

      // Then hide it
      await act(async () => {
        fireEvent.press(getByTestId('hide-player'));
      });

      expect(getByTestId('current-recording').children[0]).toBe('No recording');
      expect(getByTestId('player-visible').children[0]).toBe('hidden');
    });

    it('should stop playback when hiding global player', async () => {
      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      // Show and then hide the player
      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
      });

      await act(async () => {
        fireEvent.press(getByTestId('hide-player'));
      });

      expect(mockAudioPlaybackService.stopPlayback).toHaveBeenCalled();
    });

    it('should handle multiple show/hide operations', async () => {
      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      // Show player
      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
      });

      expect(getByTestId('player-visible').children[0]).toBe('visible');

      // Hide player
      await act(async () => {
        fireEvent.press(getByTestId('hide-player'));
      });

      expect(getByTestId('player-visible').children[0]).toBe('hidden');

      // Show player again
      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
      });

      expect(getByTestId('player-visible').children[0]).toBe('visible');
    });

    it('should handle stopPlayback errors gracefully', async () => {
      mockAudioPlaybackService.stopPlayback.mockRejectedValue(new Error('Stop failed'));

      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      // Show and then hide the player
      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
      });

      // This should not throw an error even if stopPlayback fails
      await act(async () => {
        fireEvent.press(getByTestId('hide-player'));
      });

      expect(getByTestId('player-visible').children[0]).toBe('hidden');
    });
  });

  describe('usePlayer Hook', () => {
    it('should throw error when used outside of PlayerProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('usePlayer must be used within a PlayerProvider');

      consoleSpy.mockRestore();
    });

    it('should provide all required context values', () => {
      const TestContextValues: React.FC = () => {
        const context = usePlayer();
        
        return (
          <div>
            <div data-testid="has-current-recording">
              {context.currentRecording !== undefined ? 'true' : 'false'}
            </div>
            <div data-testid="has-set-current-recording">
              {typeof context.setCurrentRecording === 'function' ? 'true' : 'false'}
            </div>
            <div data-testid="has-is-global-player-visible">
              {typeof context.isGlobalPlayerVisible === 'boolean' ? 'true' : 'false'}
            </div>
            <div data-testid="has-set-is-global-player-visible">
              {typeof context.setIsGlobalPlayerVisible === 'function' ? 'true' : 'false'}
            </div>
            <div data-testid="has-show-global-player">
              {typeof context.showGlobalPlayer === 'function' ? 'true' : 'false'}
            </div>
            <div data-testid="has-hide-global-player">
              {typeof context.hideGlobalPlayer === 'function' ? 'true' : 'false'}
            </div>
          </div>
        );
      };

      const { getByTestId } = render(
        <PlayerProvider>
          <TestContextValues />
        </PlayerProvider>
      );

      expect(getByTestId('has-current-recording').children[0]).toBe('true');
      expect(getByTestId('has-set-current-recording').children[0]).toBe('true');
      expect(getByTestId('has-is-global-player-visible').children[0]).toBe('true');
      expect(getByTestId('has-set-is-global-player-visible').children[0]).toBe('true');
      expect(getByTestId('has-show-global-player').children[0]).toBe('true');
      expect(getByTestId('has-hide-global-player').children[0]).toBe('true');
    });
  });

  describe('State Management', () => {
    it('should maintain state consistency across operations', async () => {
      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      // Initial state
      expect(getByTestId('current-recording').children[0]).toBe('No recording');
      expect(getByTestId('player-visible').children[0]).toBe('hidden');

      // Show player
      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
      });

      expect(getByTestId('current-recording').children[0]).toBe('Test Recording');
      expect(getByTestId('player-visible').children[0]).toBe('visible');

      // Hide player
      await act(async () => {
        fireEvent.press(getByTestId('hide-player'));
      });

      expect(getByTestId('current-recording').children[0]).toBe('No recording');
      expect(getByTestId('player-visible').children[0]).toBe('hidden');
    });

    it('should handle rapid state changes', async () => {
      const { getByTestId } = render(
        <PlayerProvider>
          <TestComponent />
        </PlayerProvider>
      );

      // Rapid show/hide operations
      await act(async () => {
        fireEvent.press(getByTestId('show-player'));
        fireEvent.press(getByTestId('hide-player'));
        fireEvent.press(getByTestId('show-player'));
      });

      expect(getByTestId('player-visible').children[0]).toBe('visible');
    });
  });
});
