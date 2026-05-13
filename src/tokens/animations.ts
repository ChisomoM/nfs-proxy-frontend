// Animation Tokens for Geepay NFS Design System
// Based on the Geepay Design System Guide

export const animations = {
  // Duration presets (fast interactions only)
  duration: {
    instant: '0ms',      // Immediate changes
    fast: '120ms',       // Hover states, dropdowns
    normal: '200ms',     // Page transitions, state changes
    slow: '300ms',       // Loading states (rare)
  },

  // Easing functions
  easing: {
    // Standard easing for most interactions
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

    // Fast easing for quick interactions
    fast: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

    // Linear for predictable motion
    linear: 'linear',

    // Bounce for success states (rare)
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Animation patterns
  patterns: {
    // Page transitions
    pageEnter: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    pageExit: {
      duration: '150ms',
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },

    // Interactive elements
    hover: {
      duration: '120ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    focus: {
      duration: '120ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },

    // Dropdowns and overlays
    dropdown: {
      duration: '120ms',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },

    // Status changes
    statusChange: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    },

    // Loading states
    loading: {
      duration: '300ms',
      easing: 'linear',
    },
  },
} as const;

// CSS Custom Properties for animations
export const animationCssVariables = {
  // Durations
  '--duration-instant': animations.duration.instant,
  '--duration-fast': animations.duration.fast,
  '--duration-normal': animations.duration.normal,
  '--duration-slow': animations.duration.slow,

  // Easings
  '--easing-standard': animations.easing.standard,
  '--easing-fast': animations.easing.fast,
  '--easing-linear': animations.easing.linear,
  '--easing-bounce': animations.easing.bounce,
} as const;

// Type definitions
export type AnimationDuration = keyof typeof animations.duration;
export type AnimationEasing = keyof typeof animations.easing;
export type AnimationPattern = keyof typeof animations.patterns;