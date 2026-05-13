// Typography Tokens for Geepay NFS Design System
// Based on the Geepay Design System Guide

export const typography = {
  // Font Families
  fonts: {
    primary: 'Inter, system-ui, -apple-system, sans-serif', // Primary UI
    heading: 'DM Sans, system-ui, -apple-system, sans-serif', // Headings
    mono: 'JetBrains Mono, ui-monospace, monospace', // Numbers & financial values
  },

  // Font Sizes (rem-based scale)
  sizes: {
    xs: '0.75rem',    // 12px - captions, small labels
    sm: '0.875rem',   // 14px - body text, buttons
    base: '1rem',     // 16px - default body
    lg: '1.125rem',   // 18px - large body
    xl: '1.25rem',    // 20px - small headings
    '2xl': '1.5rem',  // 24px - headings
    '3xl': '1.875rem', // 30px - large headings
    '4xl': '2.25rem',  // 36px - page titles
    '5xl': '3rem',     // 48px - hero titles
  },

  // Font Weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
} as const;

// Typography Scale Presets
export const textStyles = {
  // Headings (DM Sans)
  h1: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h4: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
  h5: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  h6: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Body Text (Inter)
  body: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodyLarge: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Labels & UI Text (Inter)
  label: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.wide,
  },
  caption: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.normal,
  },

  // Financial Values (JetBrains Mono) - CRITICAL: Always use monospace
  financial: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
  financialLarge: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
  financialSmall: {
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
} as const;

// CSS Custom Properties for typography
export const typographyCssVariables = {
  // Font families
  '--font-geepay-primary': typography.fonts.primary,
  '--font-geepay-heading': typography.fonts.heading,
  '--font-geepay-mono': typography.fonts.mono,

  // Font sizes
  '--text-xs': typography.sizes.xs,
  '--text-sm': typography.sizes.sm,
  '--text-base': typography.sizes.base,
  '--text-lg': typography.sizes.lg,
  '--text-xl': typography.sizes.xl,
  '--text-2xl': typography.sizes['2xl'],
  '--text-3xl': typography.sizes['3xl'],
  '--text-4xl': typography.sizes['4xl'],
  '--text-5xl': typography.sizes['5xl'],
} as const;

// Type definitions
export type TypographyTokens = typeof typography;
export type TextStyle = keyof typeof textStyles;