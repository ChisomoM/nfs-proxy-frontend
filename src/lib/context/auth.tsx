import type { ReactNode } from 'react';
import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
// import { post } from '../api/crud';
import type {
  LoginUser,
  AccountType,
} from '@/types/auth';
import { STORAGE_KEYS } from '@/types/auth';
import { AuthContext } from './AuthContext';
import { fetchData } from '../api/crud';


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKENS);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  }, []);

 
  const restoreSessionFromStorage = useCallback(() => {
    try {
      const storedTokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedTokens && storedUser) {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);

        setTokens(parsedTokens);
        setUser(parsedUser);
      }
    } catch (err) {
      console.error('Failed to restore session from storage:', err);
      clearStorage();
    } finally {
      setIsLoading(false);
    }
  }, [clearStorage]);

  /**
   * Persist auth state to localStorage
   * Called after login to save tokens and user data
   */
  const saveToStorage = useCallback(
    (authUser: AuthUser, authTokens: AuthTokens) => {
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(authTokens));
      } catch (err) {
        console.error('Failed to save auth state to storage:', err);
        toast.error('Failed to save authentication state');
      }
    },
    []
  );
   
  // New API only: response.data.user + response.data.token
  const deriveUserFromResponse = useCallback(
    (user: LoginUser, accountType: AccountType): AuthUser => {
      const baseUser: AuthUser = {
        id: String(user.id ?? ''),
        email: user.email ?? '',
        accountType,
        isActive: !(user.blocked ?? false),
        isVerified: true,
        firstName: user.first_name ?? undefined,
        lastName: user.last_name ?? undefined,
      };

      if (user.is_superUser) baseUser.role = 'admin';

      return baseUser;
    },
    []
  );



  const login = useCallback(
    async (email: string, password: string, accountType: AccountType = 'admin') => {
      try {
        setIsLoading(true);
        setError(null);

        const endpoint = accountType === 'admin' ? 'ADMIN_LOGIN' : 'LOGIN';
        const response = await fetchData(endpoint, 'POST', {}, { email, password });
        
        // Handle common.Response structure: { message: "...", status: 0, data: { user: {...}, token: "..." } }
        const payload = response; // fetchData already extracts .data if status is 0
        const userPayload = payload?.user as LoginUser;
        const token = (payload?.token || payload?.access_token) as string;

        if (!userPayload || !token) {
          // If login requires OTP (merchant), the backend might return a message like "OTP required"
          // but for now we assume this login is for Admin (no OTP) or first step for Merchant.
          throw new Error('Invalid login response from server');
        }

        const authUser = deriveUserFromResponse(userPayload, accountType);
        const authTokens: AuthTokens = { token };

        saveToStorage(authUser, authTokens);
        setTokens(authTokens);
        setUser(authUser);

        toast.success('Login successful!');
        const redirectPath = accountType === 'merchant' ? '/merchant/dashboard' : '/admin/dashboard';
        navigate(redirectPath);
      } catch (err: any) {
        const errorMsg = err.message || 'Login failed';
        setError(errorMsg);
        // Don't toast here if it's just "OTP error", let the UI handle it
        if (!errorMsg.toLowerCase().includes('otp')) {
          toast.error(errorMsg);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [saveToStorage, navigate, deriveUserFromResponse]
  );

  const loginWithOTP = useCallback(
    async (email: string, password: string, otp: string, accountType: AccountType = 'merchant') => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchData('LOGIN', 'POST', {}, { email, password, otp });
        const userPayload = response?.user as LoginUser;
        const token = (response?.token || response?.access_token) as string;

        if (!userPayload || !token) throw new Error('Invalid login response');

        const authUser = deriveUserFromResponse(userPayload, accountType);
        const authTokens: AuthTokens = { token };

        saveToStorage(authUser, authTokens);
        setTokens(authTokens);
        setUser(authUser);

        toast.success('Sign in successful!');
        navigate('/merchant/dashboard');
      } catch (err: any) {
        const errorMsg = err.message || 'Verification failed';
        setError(errorMsg);
        toast.error(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [saveToStorage, navigate, deriveUserFromResponse]
  );

  const sendOTP = useCallback(async (email: string, reason: string) => {
    try {
      await fetchData('SEND_OTP', 'POST', {}, { email, reason });
      toast.success('OTP sent successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
      throw err;
    }
  }, []);

  const acceptInvite = useCallback(async (token: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetchData('ACCEPT_INVITE', 'POST', {}, { invite_token: token, password });
      
      const userPayload = response?.user as LoginUser;
      const authToken = (response?.token || response?.access_token) as string;

      if (!userPayload || !authToken) throw new Error('Invalid invite response');

      const authUser = deriveUserFromResponse(userPayload, 'merchant');
      const authTokens: AuthTokens = { token: authToken };

      saveToStorage(authUser, authTokens);
      setTokens(authTokens);
      setUser(authUser);

      toast.success('Account setup complete!');
      navigate('/merchant/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept invite');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveToStorage, navigate, deriveUserFromResponse]);

  /**
    LOGOUT - Clear all auth state and redirect to login
   */
  const logout = useCallback(async () => {
    try {
      const accountType = user?.accountType;
      // Clear storage and state
      clearStorage();
      setTokens(null);
      setUser(null);
      setError(null);

      // Redirect based on previous account type
      const redirectPath = accountType === 'admin' ? '/admin/login' : '/merchant/login';
      navigate(redirectPath);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout failed');
    }
  }, [clearStorage, navigate, user?.accountType]);


  useEffect(() => {
    restoreSessionFromStorage();
  }, [restoreSessionFromStorage]);



  const value: AuthContextValue = {
    // State
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user && !!tokens,
    error,

    // Methods
    login,
    loginWithOTP,
    sendOTP,
    acceptInvite,
    logout,
    setUser,
    setTokens,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
