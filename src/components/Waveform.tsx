import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import AudioAnalysisService, { AudioAnalysisData } from '../services/AudioAnalysisService';

interface WaveformProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  currentTime?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

const { width } = Dimensions.get('window');
const WAVEFORM_WIDTH = width - 40;
const BAR_COUNT = 60;
const BAR_WIDTH = WAVEFORM_WIDTH / BAR_COUNT - 1;

const Waveform: React.FC<WaveformProps> = ({
  isRecording,
  isPaused,
  duration,
  currentTime = 0,
  height = 120,
  color = '#007aff',
  backgroundColor = '#f0f0f0',
}) => {
  const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(0));
  const [recordingBars, setRecordingBars] = useState<number[]>([]);
  const [animationValue] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [currentAnalysis, setCurrentAnalysis] = useState<AudioAnalysisData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef(0);

  // Create gradient colors based on voice intensity
  const getGradientColors = (intensity: number) => {
    const alpha = Math.min(intensity * 2, 1);
    return [
      { offset: '0%', stopColor: color, stopOpacity: alpha * 0.8 },
      { offset: '50%', stopColor: color, stopOpacity: alpha },
      { offset: '100%', stopColor: color, stopOpacity: alpha * 0.6 },
    ];
  };

  // Simulate voice pitch and intensity
  const generateVoiceData = (time: number) => {
    const baseFreq = 0.1 + Math.sin(time * 0.05) * 0.05; // Base frequency variation
    const pitch = Math.sin(time * 0.1) * 0.3 + 0.7; // Pitch variation
    const intensity = Math.sin(time * 0.15) * 0.4 + 0.6; // Voice intensity
    
    return {
      frequency: baseFreq,
      pitch,
      intensity: Math.max(intensity, 0.2),
    };
  };

  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingTimeRef.current = 0;
      
      // Start pulse animation
      const pulseAnimationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimationLoop.start();

      // Start audio analysis
      AudioAnalysisService.startAnalysis();
      
      // Subscribe to audio analysis data
      const unsubscribe = AudioAnalysisService.addAnalysisListener((analysisData) => {
        setCurrentAnalysis(analysisData);
        
        // Create new bar data based on real audio analysis
        const intensity = analysisData.intensity;
        const pitch = analysisData.pitch;
        const amplitude = analysisData.amplitude;
        
        // Combine multiple factors for more realistic waveform
        const barHeight = (intensity * 0.6 + amplitude * 0.3 + pitch * 0.1) * height * 0.8 + height * 0.1;
        
        setRecordingBars(prev => {
          const newBars = [...prev, barHeight];
          // Keep only the last BAR_COUNT bars for scrolling effect
          return newBars.slice(-BAR_COUNT);
        });

        // Update animation value for recording indicator
        animationValue.setValue(intensity);
      });

      return () => {
        pulseAnimationLoop.stop();
        AudioAnalysisService.stopAnalysis();
        unsubscribe();
      };
    } else if (isRecording && isPaused) {
      // Keep current waveform when paused
      AudioAnalysisService.stopAnalysis();
    } else {
      // Generate static waveform for playback
      generateStaticWaveform();
      AudioAnalysisService.stopAnalysis();
    }
  }, [isRecording, isPaused, duration, height]);

  const generateStaticWaveform = () => {
    const staticBars = new Array(BAR_COUNT).fill(0).map((_, index) => {
      // Create a more realistic waveform pattern with voice-like characteristics
      const progress = index / BAR_COUNT;
      
      // Create multiple frequency components for more realistic audio waveform
      const lowFreq = Math.sin(progress * Math.PI * 2) * 0.3;
      const midFreq = Math.sin(progress * Math.PI * 8) * 0.2;
      const highFreq = Math.sin(progress * Math.PI * 16) * 0.1;
      
      // Add some randomness for natural variation
      const randomVariation = (Math.random() - 0.5) * 0.1;
      
      // Combine frequencies with some voice-like characteristics
      const combinedSignal = lowFreq + midFreq + highFreq + randomVariation;
      const normalizedSignal = (combinedSignal + 1) / 2; // Normalize to 0-1
      
      const barHeight = normalizedSignal * height * 0.8 + height * 0.1;
      return Math.max(barHeight, 4);
    });
    setBars(staticBars);
  };

  const getCurrentBarIndex = () => {
    if (duration === 0) return 0;
    return Math.floor((currentTime / duration) * BAR_COUNT);
  };

  const renderBars = () => {
    const currentBarIndex = getCurrentBarIndex();
    const barsToRender = isRecording ? recordingBars : bars;
    
    return barsToRender.map((barHeight, index) => {
      const isActive = !isRecording && index <= currentBarIndex;
      const isCurrent = !isRecording && index === currentBarIndex;
      const isUpcoming = !isRecording && index > currentBarIndex;
      
      // Dynamic colors based on voice intensity and audio analysis
      let intensity = isRecording ? (barHeight / height) : (isActive ? 1 : 0.3);
      let barColor = isActive ? color : backgroundColor;
      
      // Use audio analysis data for more dynamic colors during recording
      if (isRecording && currentAnalysis) {
        const analysisIntensity = currentAnalysis.intensity;
        const analysisPitch = currentAnalysis.pitch;
        
        // Create color variations based on pitch and intensity
        const colorIntensity = Math.min(analysisIntensity * 1.5, 1);
        const pitchFactor = analysisPitch;
        
        // Adjust color based on pitch (higher pitch = more blue, lower pitch = more red)
        if (pitchFactor > 0.6) {
          barColor = `rgba(0, 122, 255, ${colorIntensity})`; // Blue for high pitch
        } else if (pitchFactor < 0.4) {
          barColor = `rgba(255, 59, 48, ${colorIntensity})`; // Red for low pitch
        } else {
          barColor = `rgba(52, 199, 89, ${colorIntensity})`; // Green for medium pitch
        }
        
        intensity = colorIntensity;
      } else if (!isRecording) {
        // Enhanced playback visualization
        if (isCurrent) {
          // Current position - bright and pulsing
          barColor = color;
          intensity = 1;
        } else if (isActive) {
          // Played portion - gradient from bright to dim
          const progress = index / currentBarIndex;
          intensity = 0.8 - (progress * 0.5); // Fade from 0.8 to 0.3
          barColor = color;
        } else if (isUpcoming) {
          // Upcoming portion - very dim
          intensity = 0.2;
          barColor = backgroundColor;
        }
        
        // Add some variation based on bar height for more realistic look
        const heightVariation = (barHeight / height) * 0.3;
        intensity = Math.max(0.1, intensity + heightVariation);
      }
      
      const finalHeight = Math.max(barHeight, 4);
      const y = (height - finalHeight) / 2;
      
      return (
        <Rect
          key={index}
          x={index * (BAR_WIDTH + 1)}
          y={y}
          width={BAR_WIDTH}
          height={finalHeight}
          fill={barColor}
          rx={BAR_WIDTH / 2}
          opacity={intensity}
        />
      );
    });
  };

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={WAVEFORM_WIDTH} height={height}>
        <Defs>
          <LinearGradient id="waveformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            {getGradientColors(0.8).map((stop, index) => (
              <Stop key={index} offset={stop.offset} stopColor={stop.stopColor} stopOpacity={stop.stopOpacity} />
            ))}
          </LinearGradient>
        </Defs>
        {renderBars()}
      </Svg>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Animated.View
            style={[
              styles.recordingDot,
              {
                backgroundColor: isPaused ? '#ff9500' : '#ff3b30',
                transform: [{ scale: pulseAnimation }],
              },
            ]}
          />
        </View>
      )}
      
      {isRecording && (
        <View style={styles.recordingText}>
          <Animated.Text
            style={[
              styles.recordingLabel,
              {
                opacity: animationValue,
                color: isPaused ? '#ff9500' : '#ff3b30',
              },
            ]}
          >
            {isPaused ? 'PAUSED' : 'RECORDING'}
          </Animated.Text>
        </View>
      )}
      
      {!isRecording && duration > 0 && (
        <View style={styles.playbackIndicator}>
          <View style={styles.playbackProgress}>
            <View 
              style={[
                styles.playbackProgressBar,
                {
                  width: `${(currentTime / duration) * 100}%`,
                  backgroundColor: color,
                }
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    position: 'relative',
  },
  recordingIndicator: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#ff3b30',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  recordingText: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  recordingLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playbackIndicator: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  playbackProgress: {
    width: '80%',
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  playbackProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default Waveform;
