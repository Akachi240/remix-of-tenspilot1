/**
 * TensPilot+ Premium Healthcare Color Scheme
 * Designed for medical applications (calming + trust + energy)
 */

export const theme = {
  // Primary: Trust + Medical Authority
  primary: {
    50: '#f0f7ff',
    100: '#e0f0ff',
    200: '#c1e2ff',
    300: '#a3d5ff',
    400: '#84c7ff',
    500: '#0284c7', // Main blue (medical blue)
    600: '#0369a1', // Darker blue
    700: '#02558f',
    800: '#164e7d',
  },

  // Success: Pain Relief / Recovery
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Vibrant green (relief indicator)
    600: '#16a34a',
    700: '#15803d',
  },

  // Warning: Pain Levels
  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#f59e0b', // Amber (caution)
    600: '#d97706',
    700: '#b45309',
  },

  // Danger: High Pain / Critical
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Red (emergency)
    600: '#dc2626',
    700: '#b91c1c',
  },

  // Neutral: UI Text & Backgrounds
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },

  // Medical status colors
  medical: {
    chronic: '#8b5cf6', // Purple (chronic pain)
    acute: '#f43f5e',   // Rose (acute pain)
    therapy: '#06b6d4', // Cyan (active therapy)
    recovery: '#10b981', // Emerald (recovery)
  }
};

export const typography = {
  // Medical-grade typography
  // (Clear, readable, accessible)
  heading: {
    xl: 'text-4xl font-bold tracking-tight',
    lg: 'text-3xl font-bold tracking-tight',
    md: 'text-2xl font-semibold tracking-tight',
    sm: 'text-xl font-semibold',
    xs: 'text-lg font-semibold',
  },

  body: {
    lg: 'text-base font-normal leading-relaxed',
    md: 'text-sm font-normal leading-relaxed',
    sm: 'text-xs font-normal leading-relaxed',
  },

  medical: {
    // For medical data display (monospace, readable)
    metric: 'font-mono text-lg font-bold', // Pain levels, percentages
    label: 'text-xs font-semibold uppercase tracking-wider', // Field labels
  }
};
