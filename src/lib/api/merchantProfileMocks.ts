/**
 * Mock data for Merchant Profile
 * Generated for frontend development before backend integration
 */

import type {
  MerchantProfileResponse,
  MerchantUser,
  UsageMetrics,
  LoginHistoryEntry,
} from './merchantProfileAPI.types';

/**
 * Mock merchant user
 */
const mockUser: MerchantUser = {
  id: 12345,
  firstName: 'John',
  lastName: 'Merchant',
  email: 'john.merchant@geepay.example.com',
  mobile: '+260123456789',
  accountType: 'merchant',
  status: 'active',
  createdAt: '2025-01-15T10:00:00Z',
  lastLoginDate: '2026-04-14T15:30:00Z',
  isVerified: true,
};

/**
 * Mock usage & charges (pay-as-you-go model)
 * No subscription plans - charges accrue as system is used
 */
const mockUsageMetrics: UsageMetrics = {
  totalChargesAccrued: 2485000, // ZMW (cumulative all-time)
  currentMonthCharges: 385000, // ZMW (April 2026 so far)
  currentMonthUsage: {
    transactionCount: 1240,
    paymentVolume: 24500000, // ZMW total processed this month
  },
  avgTransactionAmount: 19758, // ZMW
  lastChargeDate: '2026-04-14T16:45:00Z',
  nextBillingDate: '2026-05-01T00:00:00Z',
  currency: 'ZMW',
};

/**
 * Mock login history (10 most recent)
 */
const mockLoginHistory: LoginHistoryEntry[] = [
  {
    id: 'login_001',
    timestamp: '2026-04-14T15:30:00Z',
    device: 'Chrome on Windows 10',
    location: 'Lusaka, Zambia',
    ipAddress: '192.168.1.100',
    status: 'active',
  },
  {
    id: 'login_002',
    timestamp: '2026-04-14T09:15:00Z',
    device: 'Safari on macOS',
    location: 'Lusaka, Zambia',
    ipAddress: '192.168.1.105',
    status: 'active',
  },
  {
    id: 'login_003',
    timestamp: '2026-04-13T18:45:00Z',
    device: 'Chrome on Windows 10',
    location: 'Lusaka, Zambia',
    ipAddress: '192.168.1.100',
    status: 'expired',
  },
  {
    id: 'login_004',
    timestamp: '2026-04-13T14:20:00Z',
    device: 'Firefox on Ubuntu',
    location: 'Ndola, Zambia',
    ipAddress: '203.45.67.89',
    status: 'logged-out',
  },
  {
    id: 'login_005',
    timestamp: '2026-04-12T11:00:00Z',
    device: 'Chrome on Windows 10',
    location: 'Lusaka, Zambia',
    ipAddress: '192.168.1.100',
    status: 'expired',
  },
  {
    id: 'login_006',
    timestamp: '2026-04-11T16:30:00Z',
    device: 'Mobile Safari on iOS',
    location: 'Livingstone, Zambia',
    ipAddress: '156.223.45.67',
    status: 'expired',
  },
  {
    id: 'login_007',
    timestamp: '2026-04-10T10:15:00Z',
    device: 'Chrome on Windows 10',
    location: 'Lusaka, Zambia',
    ipAddress: '192.168.1.100',
    status: 'expired',
  },
  {
    id: 'login_008',
    timestamp: '2026-04-09T13:45:00Z',
    device: 'Chrome on Android',
    location: 'Kitwe, Zambia',
    ipAddress: '167.334.89.12',
    status: 'expired',
  },
  {
    id: 'login_009',
    timestamp: '2026-04-08T09:30:00Z',
    device: 'Firefox on Windows 10',
    location: 'Lusaka, Zambia',
    ipAddress: '192.168.1.110',
    status: 'expired',
  },
  {
    id: 'login_010',
    timestamp: '2026-04-07T15:00:00Z',
    device: 'Chrome on Windows 10',
    location: 'Lusaka, Zambia',
    ipAddress: '192.168.1.100',
    status: 'expired',
  },
];

/**
 * Complete mock merchant profile response
 */
export const MOCK_MERCHANT_PROFILE: MerchantProfileResponse = {
  user: mockUser,
  usage: mockUsageMetrics,
  activity: {
    recentLogins: mockLoginHistory,
    totalSessions: 47, // Total sessions (not just recent 10)
  },
};

/**
 * Helper function to get initials for avatar
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0);
  const last = lastName.charAt(0);
  return `${first}${last}`.toUpperCase();
}

/**
 * Helper to format currency (ZMW)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Helper to format timestamp to readable date
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-ZM', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Helper to get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(isoString);
}
