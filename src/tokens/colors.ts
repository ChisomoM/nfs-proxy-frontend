// Design System Color Tokens for Geepay NFS
// Based on the Geepay Design System Guide

export const colors = {
  // Geepay Core Palette
  geepay: {
    primary: {
      700: '#373C91',
      600: '#4A50A8',
      500: '#5C62BD',
    },
    accent: {
      600: '#03AEE9',
      500: '#29BDF0',
      400: '#5CCEF5',
    },
    midnight: {
      950: '#05070F',
      900: '#0B1020',
      800: '#12182A',
      700: '#1B2236',
    },
    emerald: {
      600: '#10B981',
      500: '#34D399',
    },
    red: {
      600: '#DC2626',
    },
  },

  // Semantic Colors for Financial States
  semantic: {
    success: '#10B981', // Money received (green)
    error: '#DC2626',   // Money sent / failure (red)
    warning: '#F59E0B', // Pending (yellow)
    info: '#3B82F6',    // General information (blue)
  },

  // Neutral Colors (for borders, text, etc.)
  neutral: {
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB', // For borders
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
} as const;

// CSS Custom Properties for global usage
export const cssVariables = {
  // Primary colors
  '--color-geepay-primary-700': colors.geepay.primary[700],
  '--color-geepay-primary-600': colors.geepay.primary[600],
  '--color-geepay-primary-500': colors.geepay.primary[500],

  // Accent colors
  '--color-geepay-accent-600': colors.geepay.accent[600],
  '--color-geepay-accent-500': colors.geepay.accent[500],
  '--color-geepay-accent-400': colors.geepay.accent[400],

  // Midnight colors (dark theme)
  '--color-geepay-midnight-950': colors.geepay.midnight[950],
  '--color-geepay-midnight-900': colors.geepay.midnight[900],
  '--color-geepay-midnight-800': colors.geepay.midnight[800],
  '--color-geepay-midnight-700': colors.geepay.midnight[700],

  // Semantic colors
  '--color-semantic-success': colors.semantic.success,
  '--color-semantic-error': colors.semantic.error,
  '--color-semantic-warning': colors.semantic.warning,
  '--color-semantic-info': colors.semantic.info,

  // Neutral colors
  '--color-neutral-grey-200': colors.neutral.grey[200],
} as const;

// Type definitions for TypeScript
export type GeepayColors = typeof colors;
export type SemanticColor = keyof typeof colors.semantic;
export type PrimaryColor = keyof typeof colors.geepay.primary;
export type AccentColor = keyof typeof colors.geepay.accent;
export type MidnightColor = keyof typeof colors.geepay.midnight;