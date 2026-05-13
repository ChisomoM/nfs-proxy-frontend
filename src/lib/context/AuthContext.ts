/**
 * AuthContext - React Context for authentication
 * Separated into own file for Vite Fast Refresh compatibility
 */

import { createContext } from 'react';
import type { AuthContextValue } from '@/types/auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
