import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, CheckCircle } from 'lucide-react';

/**
 * Animations & Polish Module
 * 
 * Reusable animation components for TensPilot UI:
 * - StepTransition: Smooth step transitions in multi-step flows
 * - ReliefSuccessAnimation: Celebration animation after session
 * - LoadingState: Skeleton and pulsing loaders
 * - FeedbackPulse: Visual feedback for interactions
 */

// ─── Step Transition Animation ───────────────────────────
interface StepTransitionProps {
  children: React.ReactNode;
  direction?: 'forward' | 'backward';
}

export const StepTransition: React.FC<StepTransitionProps> = ({
  children,
  direction = 'forward',
}) => {
  const slideVariants = {
    enter: (d: string) => ({
      x: d === 'forward' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (d: string) => ({
      zIndex: 0,
      x: d === 'forward' ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      }}
    >
      {children}
    </motion.div>
  );
};

// ─── Relief Success Animation ──────────────────────────
interface ReliefSuccessAnimationProps {
  painReduction: number; // percentage 0-100
  beforeLevel: number;
  afterLevel: number;
  isVisible: boolean;
}

export const ReliefSuccessAnimation: React.FC<ReliefSuccessAnimationProps> = ({
  painReduction,
  beforeLevel,
  afterLevel,
  isVisible,
}) => {
  const getReliefLabel = (pct: number) => {
    if (pct >= 76) return { label: 'Excellent Relief! 🎉', color: 'text-green-600' };
    if (pct >= 51) return { label: 'Great Relief! ✨', color: 'text-green-500' };
    if (pct >= 26) return { label: 'Good Progress 👍', color: 'text-yellow-600' };
    return { label: 'Some Help 💪', color: 'text-blue-600' };
  };

  const { label, color } = getReliefLabel(painReduction);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="space-y-4 text-center">
            {/* Animated confetti / sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 1,
                }}
                animate={{
                  opacity: 0,
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: 0,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            ))}

            {/* Center card */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.6,
                repeat: 2,
              }}
              className={`bg-white rounded-2xl p-8 shadow-2xl max-w-sm ${color}`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: 2 }}
              >
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              </motion.div>

              <h2 className={`text-2xl font-bold ${color} mb-2`}>{label}</h2>

              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between px-4">
                  <span>Before:</span>
                  <span className="font-bold text-red-600">{beforeLevel}/10</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-1 bg-gradient-to-r from-red-600 to-green-600 rounded-full"
                />
                <div className="flex justify-between px-4">
                  <span>After:</span>
                  <span className="font-bold text-green-600">{afterLevel}/10</span>
                </div>
              </div>

              <div className="mt-4 text-lg font-bold text-green-600">
                {Math.round(painReduction)}% Relief
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Loading States ───────────────────────────────────
interface SkeletonLoaderProps {
  count?: number;
  height?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  height = 'h-4',
}) => {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`${height} bg-gray-200 rounded`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
};

interface PulsingLoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PulsingLoader: React.FC<PulsingLoaderProps> = ({
  label = 'Loading...',
  size = 'md',
}) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizes[size]} rounded-full border-4 border-blue-200 border-t-blue-600`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {label && <p className="text-sm text-gray-600">{label}</p>}
    </div>
  );
};

// ─── Feedback Pulse ───────────────────────────────────
interface FeedbackPulseProps {
  children: React.ReactNode;
  type?: 'success' | 'warning' | 'error' | 'info';
}

export const FeedbackPulse: React.FC<FeedbackPulseProps> = ({
  children,
  type = 'info',
}) => {
  const colorMap = {
    success: 'border-green-400 bg-green-50',
    warning: 'border-yellow-400 bg-yellow-50',
    error: 'border-red-400 bg-red-50',
    info: 'border-blue-400 bg-blue-50',
  };

  return (
    <motion.div
      className={`border-2 ${colorMap[type]} rounded-lg p-4`}
      animate={{
        boxShadow: [
          `0 0 0 0 rgba(59, 130, 246, 0.7)`,
          `0 0 0 10px rgba(59, 130, 246, 0)`,
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: 2,
      }}
    >
      {children}
    </motion.div>
  );
};

// ─── Mode Card Hover Animation ──────────────────────────
interface AnimatedModeCardProps {
  emoji: string;
  title: string;
  tagline: string;
  isSelected: boolean;
  onClick: () => void;
}

export const AnimatedModeCard: React.FC<AnimatedModeCardProps> = ({
  emoji,
  title,
  tagline,
  isSelected,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
      }}
      className="border-2 rounded-xl p-4 cursor-pointer transition-all"
      onClick={onClick}
    >
      <motion.div
        animate={{
          scale: isSelected ? 1.2 : 1,
        }}
        className="text-4xl mb-2"
      >
        {emoji}
      </motion.div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{tagline}</p>
    </motion.div>
  );
};

// ─── Intensity Slider with Visual Feedback ─────────────
interface AnimatedIntensitySliderProps {
  value: number;
  onChange: (_value: number) => void;
  min?: number;
  max?: number;
}

export const AnimatedIntensitySlider: React.FC<AnimatedIntensitySliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={0.5}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: value > 7 ? 1 : 0,
          }}
          className="text-2xl font-bold text-blue-600 min-w-12 text-center"
        >
          {value}
        </motion.div>
      </div>

      {/* Animated intensity indicator */}
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Feedback text */}
      <p className="text-xs text-gray-600">
        {value < 3 && '💙 Gentle'}
        {value >= 3 && value < 6 && '💪 Moderate'}
        {value >= 6 && value < 8 && '🔥 Strong'}
        {value >= 8 && '⚡ Maximum'}
      </p>
    </div>
  );
};

// ─── Session Complete Card Animation ───────────────────
interface SessionCompleteAnimationProps {
  duration: number;
  painReduction: number;
}

export const SessionCompleteAnimation: React.FC<SessionCompleteAnimationProps> = ({
  duration,
  painReduction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 p-6">
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>

          <div className="flex-1">
            <h3 className="font-bold text-green-900 mb-2">Session Complete! 🎉</h3>
            <div className="space-y-2 text-sm text-green-800">
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                ✓ Duration: <strong>{duration} minutes</strong>
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                ✓ Pain Reduction: <strong>{Math.round(painReduction)}%</strong>
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                ✓ Session saved to your history
              </motion.p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// ─── CSS for slider thumb ───────────────────────────────
// Add to global CSS or use CSS modules
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    border: 2px solid white;
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    border: 2px solid white;
  }
`;

export const AnimationStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = sliderStyles;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return null;
};

export default {
  StepTransition,
  ReliefSuccessAnimation,
  SkeletonLoader,
  PulsingLoader,
  FeedbackPulse,
  AnimatedModeCard,
  AnimatedIntensitySlider,
  SessionCompleteAnimation,
  AnimationStyles,
};
