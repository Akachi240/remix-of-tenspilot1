import React from 'react'
import { motion } from 'framer-motion'
import { theme } from '@/lib/theme'

interface PainLevelIndicatorProps {
  level: number // 0-10
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (_level: number) => void
}

/**
 * Premium pain level visualization
 * Shows 0-10 scale with color gradient and smooth animations
 */
export function PainLevelIndicator({
  level,
  showLabel = true,
  size = 'md',
  interactive = false,
  onChange
}: PainLevelIndicatorProps) {
  const sizeConfig = {
    sm: { container: 'w-24 h-24', text: 'text-2xl' },
    md: { container: 'w-32 h-32', text: 'text-4xl' },
    lg: { container: 'w-40 h-40', text: 'text-5xl' },
  }

  // Color gradient based on pain level
  const getColor = (l: number) => {
    if (l <= 3) return theme.success[500]      // Green: mild
    if (l <= 6) return theme.warning[500]      // Amber: moderate
    if (l <= 8) return theme.danger[400]       // Orange-red: high
    return theme.danger[600]                   // Red: severe
  }

  const getLabel = (l: number) => {
    if (l === 0) return 'No Pain'
    if (l <= 3) return 'Mild'
    if (l <= 5) return 'Moderate'
    if (l <= 7) return 'Significant'
    if (l <= 9) return 'Severe'
    return 'Extreme'
  }

  const color = getColor(level)
  const circumference = 2 * Math.PI * 45

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={`relative ${sizeConfig[size].container}`}
        animate={{
          scale: level > 7 ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: 2, repeat: level > 7 ? Infinity : 0 }}
      >
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={theme.neutral[200]}
            strokeWidth="8"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: circumference - (level / 10) * circumference
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${sizeConfig[size].text} font-bold`}
            style={{ color }}
            key={level}
            animate={{ scale: [0.8, 1] }}
            transition={{ duration: 0.3 }}
          >
            {level}
          </motion.span>
          <span className="text-xs font-semibold text-slate-500">/10</span>
        </div>
      </motion.div>

      {showLabel && (
        <motion.p
          className="text-sm font-medium text-center"
          style={{ color }}
          key={getLabel(level)}
          animate={{ opacity: [0.5, 1] }}
          transition={{ duration: 0.3 }}
        >
          {getLabel(level)}
        </motion.p>
      )}

      {interactive && (
        <div className="flex gap-2 mt-4 flex-wrap justify-center max-w-[280px]">
          {Array.from({ length: 11 }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => onChange?.(i)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-8 h-8 rounded-full font-bold text-xs transition-all ${
                i === level
                  ? 'ring-2 ring-offset-2 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: getColor(i),
                color: 'white',
                borderColor: i === level ? getColor(i) : 'transparent',
              }}
            >
              {i}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
