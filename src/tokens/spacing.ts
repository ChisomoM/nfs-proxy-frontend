// Spacing Tokens for Geepay NFS Design System
// Based on the Geepay Design System Guide

export const spacing = {
  // Base spacing scale (4px increments)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

// Component-level spacing rules
export const componentSpacing = {
  // Layout spacing
  page: {
    padding: spacing[6],      // 24px - main content padding
    margin: spacing[8],       // 32px - section margins
  },

  // Card spacing
  card: {
    padding: spacing[6],      // 24px - card content padding
    gap: spacing[4],          // 16px - elements within card
  },

  // Form spacing
  form: {
    fieldGap: spacing[4],     // 16px - between form fields
    sectionGap: spacing[6],   // 24px - between form sections
    labelMargin: spacing[2],  // 8px - label bottom margin
  },

  // Table spacing
  table: {
    cellPadding: spacing[3],  // 12px - table cell padding
    rowGap: spacing[1],       // 4px - between rows
  },

  // Navigation spacing
  nav: {
    itemPadding: spacing[3],  // 12px - nav item padding
    sidebarWidth: '280px',    // Fixed sidebar width
  },

  // Button spacing
  button: {
    paddingX: spacing[4],     // 16px - horizontal padding
    paddingY: spacing[2],     // 8px - vertical padding
    gap: spacing[2],          // 8px - icon + text gap
  },

  // Status/Alert spacing
  status: {
    padding: spacing[3],      // 12px - status badge padding
    iconMargin: spacing[2],   // 8px - icon margin
  },
} as const;

// Layout patterns
export const layoutPatterns = {
  // App shell
  appShell: {
    sidebarWidth: '280px',
    headerHeight: '64px',
    contentPadding: spacing[6],
  },

  // Dashboard sections
  dashboard: {
    sectionGap: spacing[8],    // 32px - between dashboard sections
    cardGap: spacing[6],       // 24px - between cards in grid
  },

  // Data density (for tables/lists)
  dataDensity: {
    compact: spacing[2],       // 8px - tight spacing
    normal: spacing[4],        // 16px - standard spacing
    relaxed: spacing[6],       // 24px - spacious
  },
} as const;

// CSS Custom Properties for spacing
export const spacingCssVariables = {
  // Base spacing scale
  '--space-0': spacing[0],
  '--space-1': spacing[1],
  '--space-2': spacing[2],
  '--space-3': spacing[3],
  '--space-4': spacing[4],
  '--space-5': spacing[5],
  '--space-6': spacing[6],
  '--space-8': spacing[8],
  '--space-10': spacing[10],
  '--space-12': spacing[12],
  '--space-16': spacing[16],
  '--space-20': spacing[20],
  '--space-24': spacing[24],
  '--space-32': spacing[32],

  // Layout patterns
  '--layout-sidebar-width': layoutPatterns.appShell.sidebarWidth,
  '--layout-header-height': layoutPatterns.appShell.headerHeight,
  '--layout-content-padding': layoutPatterns.appShell.contentPadding,
} as const;

// Type definitions
export type SpacingScale = keyof typeof spacing;
export type ComponentSpacing = typeof componentSpacing;
export type LayoutPatterns = typeof layoutPatterns;