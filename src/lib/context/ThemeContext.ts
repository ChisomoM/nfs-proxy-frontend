/**
 * ThemeContext - React Context for Geepay Design System tokens
 * Provides global access to colors, typography, spacing, and animation tokens
 */

import { createContext } from 'react';
import type { GeepayColors, TypographyTokens, ComponentSpacing, LayoutPatterns, AnimationDuration, AnimationEasing } from '@/tokens';

export interface ThemeContextValue {
  colors: GeepayColors;
  typography: TypographyTokens;
  spacing: ComponentSpacing;
  layout: LayoutPatterns;
  animations: {
    duration: Record<AnimationDuration, string>;
    easing: Record<AnimationEasing, string>;
  };
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);