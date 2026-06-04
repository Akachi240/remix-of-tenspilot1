import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RingProgressProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
  /** Subtle live pulse on the ring stroke */
  live?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const RingProgress = ({
  value,
  size = 160,
  strokeWidth = 10,
  label,
  sublabel,
  color = 'var(--ring-fill)',
  trackColor = 'var(--ring-track)',
  live = false,
  className,
  children,
}: RingProgressProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={cn('relative inline-flex flex-col items-center gap-2', className)}
      role="img"
      aria-label={label ? `${label}: ${Math.round(clamped)}%` : `${Math.round(clamped)} percent`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={cn('device-ring -rotate-90', live && 'device-ring-live')}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            opacity={0.35}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
          {children ?? (
            <>
              <span className="text-3xl font-bold tabular-nums tracking-tight text-[var(--ink)]">
                {Math.round(clamped)}
              </span>
              {sublabel && (
                <span className="text-xs font-medium text-[var(--ink-muted)]">{sublabel}</span>
              )}
            </>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-semibold text-[var(--ink-muted)]">{label}</span>
      )}
    </div>
  );
};
