import type { ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { componentSpacing, layoutPatterns } from '@/tokens/spacing';
import { animations } from '@/tokens/animations';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = {
    colors,
    typography,
    spacing: componentSpacing,
    layout: layoutPatterns,
    animations: {
      duration: animations.duration,
      easing: animations.easing,
    },
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}