import React from 'react'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { motion } from 'framer-motion'

interface RiskAlertProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info' | 'caution' | 'warn'
  title: string
  message: string
  action?: string
  onAction?: () => void
}

/**
 * Medical risk alert component
 * Used for contraindications, medication notes, etc.
 */
export function RiskAlert({
  severity,
  title,
  message,
  action,
  onAction
}: RiskAlertProps) {
  const styles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      icon: AlertTriangle,
      color: 'text-red-800',
      accentColor: 'red',
    },
    high: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      icon: AlertTriangle,
      color: 'text-orange-800',
      accentColor: 'orange',
    },
    warn: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      icon: AlertTriangle,
      color: 'text-orange-800',
      accentColor: 'orange',
    },
    medium: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      icon: AlertCircle,
      color: 'text-amber-800',
      accentColor: 'amber',
    },
    caution: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      icon: AlertCircle,
      color: 'text-amber-800',
      accentColor: 'amber',
    },
    low: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      icon: Info,
      color: 'text-blue-800',
      accentColor: 'blue',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      icon: Info,
      color: 'text-blue-800',
      accentColor: 'blue',
    },
  }

  const style = styles[severity] || styles.info
  const Icon = style.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${style.bg} border-l-4 ${style.border} p-4 rounded-lg`}
    >
      <div className="flex gap-3">
        <Icon className={`${style.color} w-5 h-5 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`${style.color} font-bold text-sm mb-1`}>{title}</h3>
          <p className={`${style.color} text-sm opacity-90 mb-3`}>{message}</p>
          {action && (
            <button
              onClick={onAction}
              className={`text-sm font-bold px-3 py-1 rounded bg-${style.accentColor}-200 hover:bg-${style.accentColor}-300 ${style.color} transition-colors`}
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
