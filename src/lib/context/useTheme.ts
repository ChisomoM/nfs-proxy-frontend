import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

/**
 * Hook to access Geepay Design System tokens
 * Must be used within a ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}