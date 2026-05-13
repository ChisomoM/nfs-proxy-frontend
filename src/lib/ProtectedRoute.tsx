import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/useAuth';
import type { AccountType } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredAccountType?: AccountType | AccountType[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredAccountType,
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Still loading auth state - show fallback
  if (isLoading) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Not authenticated - redirect to the correct login page for the required role
  if (!isAuthenticated || !user) {
    const loginPath =
      requiredAccountType === 'merchant' ||
      (Array.isArray(requiredAccountType) && requiredAccountType.includes('merchant') && !requiredAccountType.includes('admin'))
        ? '/merchant/login'
        : '/admin/login';
    return <Navigate to={loginPath} replace />;
  }

  // Check if user has required account type
  if (requiredAccountType) {
    const requiredTypes = Array.isArray(requiredAccountType)
      ? requiredAccountType
      : [requiredAccountType];

    // Prefer explicit `accountType` stored on the user; fall back to 'admin' for
    // legacy sessions that pre-date role support.
    const effectiveAccountType: AccountType = user.accountType ?? 'admin';

    if (!requiredTypes.includes(effectiveAccountType)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}
