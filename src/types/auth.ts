/**
 * Auth Types - Adapted to the new login response shape used by the API.
 * New login response example:
 * {
 *   "data": { "user": { ... }, "token": "..." },
 *   "message": "Login successful",
 *   "status": "success"
 * }
 */

// Roles supported by GeePay NFS
export type AccountType = 'admin' | 'merchant';

// User object returned by the new login endpoint
export interface LoginUser {
  blocked: boolean;
  id: number | string;
  status: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superUser: boolean;
  mobile?: string | null;
  last_login_date?: string | null;
  failed_attempts?: number;
  role_id?: number | null;
}

// Tokens returned by the new login endpoint (single token string)
export interface AuthTokens {
  token: string;
  // keep optional legacy fields to remain flexible for other endpoints
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  token_type?: string;
}

// Unified AuthUser for use across the app. It can contain fields from the LoginUser
// but also keep optional fields used previously (company/team_member, accountType, etc.)
export interface AuthUser extends Partial<LoginUser> {
  // legacy/optional fields for merchants/admins
  accountType?: AccountType;
  company?: Record<string, unknown> | null;
  team_member?: Record<string, unknown> | null;
  // convenience normalized names
  firstName?: string;
  lastName?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

// API Response structure for the new login
export interface LoginResponse {
  status: string; // e.g. "success" or "error"
  message: string;
  data: {
    user: LoginUser;
    token: string;
  };
}

// Auth Context State
export interface AuthContextState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Auth Context Methods
export interface AuthContextMethods {
  // accountType selects which portal the user is logging in to
  login(email: string, password: string, accountType?: AccountType): Promise<void>;
  loginWithOTP(email: string, password: string, otp: string, accountType?: AccountType): Promise<void>;
  sendOTP(email: string, reason: string): Promise<void>;
  acceptInvite(token: string, password: string): Promise<void>;
  logout(): Promise<void>;
  setUser(user: AuthUser | null): void;
  setTokens(tokens: AuthTokens | null): void;
  clearError(): void;
}

// Complete Auth Context Value
export interface AuthContextValue extends AuthContextState, AuthContextMethods {}

// Storage keys (namespaced)
export const STORAGE_KEYS = {
  TOKENS: 'gp_auth_token',
  USER: 'gp_auth_user',
} as const;

