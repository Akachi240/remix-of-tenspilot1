import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { theme, typography } from '@/lib/theme'

interface DataPoint {
  timestamp: string
  painLevel: number
  relief: number
}

interface RealtimeChartProps {
  data: DataPoint[]
  title: string
  height?: number
}

/**
 * Premium real-time chart showing pain trends
 * Updates smoothly as new sessions complete
 */
export function RealtimeChart({
  data,
  title,
  height = 300
}: RealtimeChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className={`${typography.heading.sm} mb-6 text-slate-900`}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            {/* Gradient for pain line */}
            <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.danger[500]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.danger[500]} stopOpacity={0.1}/>
            </linearGradient>
            {/* Gradient for relief line */}
            <linearGradient id="colorRelief" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.success[500]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={theme.success[500]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={theme.neutral[200]} />
          <XAxis
            dataKey="timestamp"
            stroke={theme.neutral[400]}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke={theme.neutral[400]}
            style={{ fontSize: '12px' }}
            domain={[0, 10]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.neutral[900],
              border: `2px solid ${theme.primary[500]}`,
              borderRadius: '12px',
              color: '#fff'
            }}
            cursor={{ stroke: theme.neutral[300] }}
          />

          {/* Pain level line */}
          <Line
            type="monotone"
            dataKey="painLevel"
            stroke={theme.danger[500]}
            fillOpacity={1}
            fill="url(#colorPain)"
            isAnimationActive={true}
            animationDuration={800}
            strokeWidth={3}
            dot={{ fill: theme.danger[500], r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* Relief percentage line (scaled to 10 for chart alignment) */}
          <Line
            type="monotone"
            dataKey="relief"
            stroke={theme.success[500]}
            fillOpacity={1}
            fill="url(#colorRelief)"
            isAnimationActive={true}
            animationDuration={800}
            strokeWidth={3}
            dot={{ fill: theme.success[500], r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
