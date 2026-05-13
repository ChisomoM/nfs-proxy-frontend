/**
 * useAuth Hook - Custom hook to use auth context
 * Separated into own file for Vite Fast Refresh compatibility
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from '@/types/auth';

/**
 * Hook to use auth context
 * Throws error if used outside of AuthProvider
 *
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
