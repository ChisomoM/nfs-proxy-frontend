/**
 * Merchant Profile API Types
 * Defines the shape of data exchanged between frontend and backend
 */

/**
 * User account information
 */
export interface MerchantUser {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  profileImage?: string; // User's profile picture URL if available
  accountType: 'merchant';
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  lastLoginDate?: string;
  isVerified?: boolean;
}

/**
 * Usage & Charges - Charges accrue as the system is used
 * No subscription plans, just pay-as-you-go metrics
 */
export interface UsageMetrics {
  totalChargesAccrued: number; // Total cumulative charges
  currentMonthCharges: number; // Charges this billing period
  currentMonthUsage: {
    transactionCount: number;
    paymentVolume: number; // Total amount processed
  };
  avgTransactionAmount: number;
  lastChargeDate?: string;
  nextBillingDate?: string;
  currency: 'ZMW';
}

/**
 * Login history entry
 */
export interface LoginHistoryEntry {
  id: string;
  timestamp: string; // ISO 8601
  device: string; // e.g., "Chrome on Windows 10"
  location?: string; // e.g., "Lusaka, Zambia"
  ipAddress?: string;
  status: 'active' | 'expired' | 'logged-out';
}

/**
 * Complete merchant profile response
 */
export interface MerchantProfileResponse {
  user: MerchantUser;
  usage: UsageMetrics;
  activity: {
    recentLogins: LoginHistoryEntry[];
    totalSessions: number;
  };
}

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  mobile?: string;
}

/**
 * Change password request
 * Standard 8 character minimum
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 2FA verification request
 * User receives OTP via email
 */
export interface Verify2FARequest {
  otp: string; // One-time passcode sent to email
}

/**
 * 2FA setup response
 */
export interface Setup2FAResponse {
  message: string;
  otpSent: boolean;
  email: string; // Masked email where OTP was sent
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Record<string, string>; // Field-level errors for validation
}
