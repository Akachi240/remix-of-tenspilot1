import React from 'react'
import { motion } from 'framer-motion'
import { theme, typography } from '@/lib/theme'

interface MedicalCardProps {
  title: string
  value: string | number
  unit?: string
  status?: 'improving' | 'stable' | 'worsening' | 'critical'
  trend?: number // percentage change
  icon?: React.ReactNode
  onClick?: () => void
}

/**
 * Premium medical data card with real-time updates
 * Shows key metrics (pain level, relief %, session count)
 */
export function MedicalCard({
  title,
  value,
  unit,
  status = 'stable',
  trend,
  icon,
  onClick
}: MedicalCardProps) {
  const statusColors = {
    improving: theme.success[500],
    stable: theme.neutral[400],
    worsening: theme.warning[500],
    critical: theme.danger[500],
  }

  const trendIcon = trend && trend > 0 ? '↓' : trend && trend < 0 ? '↑' : '→'
  const trendColor = trend && trend > 0 ? theme.success[500] : trend && trend < 0 ? theme.danger[500] : theme.neutral[400]

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg cursor-pointer"
    >
      {/* Status indicator bar */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: statusColors[status] }}
      />

      {/* Icon + Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className={`${typography.medical.label} text-slate-600`}>
            {title}
          </p>
        </div>
        {icon && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            {icon}
          </motion.div>
        )}
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-2">
        <span className={`${typography.medical.metric} text-slate-900`}>
          {value}
        </span>
        {unit && (
          <span className={`${typography.body.sm} text-slate-500`}>
            {unit}
          </span>
        )}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: trendColor }}
          >
            {trendIcon}
          </span>
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {Math.abs(trend)}% vs last week
          </span>
        </div>
      )}

      {/* Subtle glow on improving status */}
      {status === 'improving' && (
        <div className="absolute inset-0 rounded-2xl bg-green-500/5 animate-pulse" />
      )}
    </motion.div>
  )
}
