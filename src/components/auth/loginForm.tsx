import { useAuth } from "@/lib/context/useAuth";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { AccountType } from '@/types/auth';

interface LoginFormProps {
  accountType?: AccountType;
}

export const LoginForm: React.FC<LoginFormProps> = ({ accountType = 'admin' }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [see, setSee] = useState(false);

  const { login, loginWithOTP, sendOTP, isLoading } = useAuth();

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) return;

    if (accountType === 'admin') {
      try {
        await login(email, password, 'admin');
      } catch (err) {
        console.error('Admin login failed:', err);
      }
    } else {
      // Merchant flow requires OTP
      try {
        await sendOTP(email, 'login');
        setShowOtp(true);
      } catch (err) {
        console.error('Failed to send OTP:', err);
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    try {
      await loginWithOTP(email, password, otp, 'merchant');
    } catch (err) {
      console.error('OTP verification failed:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-gray-100/50 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-block"
          >
            <span className="text-3xl font-display font-bold tracking-tight">
              <span className="text-gp-cobalt">Gee</span><span className="text-gp-sky">Pay</span>{' '}
              <span className="text-gray-900">NFS</span>
            </span>
          </motion.div>
          <p className="font-sans text-sm text-gray-500">
            {showOtp
              ? `Enter the verification code sent to ${email}`
              : `Secure access to the ${accountType === 'admin' ? 'Administrative Control' : 'Merchant Portal'}`
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showOtp ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleInitialSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  Email Address
                </Label>
                <Input
                  placeholder={accountType === 'merchant' ? 'merchant@geepay.com' : 'admin@geepay.com'}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border-gray-200 font-sans focus:ring-2 focus:ring-gp-sky/20 focus:border-gp-sky transition-all duration-200"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Password
                  </Label>
                  {accountType === 'admin' && (
                    <button
                      type="button"
                      className="font-sans text-xs font-medium text-gp-sky hover:text-gp-cobalt transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Input
                    placeholder="••••••••"
                    id="password"
                    type={see ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-12 pl-4 pr-12 rounded-xl border-gray-200 font-sans focus:ring-2 focus:ring-gp-sky/20 focus:border-gp-sky transition-all duration-200"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setSee(!see)}
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gp-cobalt transition-colors duration-200"
                    tabIndex={-1}
                  >
                    {see ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full h-12 font-sans font-semibold rounded-xl text-base shadow-lg transition-all duration-300 disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{accountType === 'merchant' ? 'Sending OTP...' : 'Authenticating...'}</span>
                  </div>
                ) : (
                "Sign In"
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="otp-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleOtpSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="otp" className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                  Security Code (OTP)
                </Label>
                <Input
                  placeholder="123456"
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full h-12 px-4 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border-gray-200 focus:ring-2 focus:ring-gp-sky/20 focus:border-gp-sky"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-[10px] text-gray-400 text-center mt-2 px-4">
                  Check your email for the security code.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="brand"
                  className="w-full h-12 font-sans font-semibold rounded-xl text-base shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setShowOtp(false)}
                  className="w-full py-2 font-sans text-sm text-gray-400 hover:text-gp-sky transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="pt-4 text-center border-t border-gray-50">
          <p className="font-sans text-[10px] text-gray-400 uppercase tracking-widest">
            Protected by GeePay Security Engine
          </p>
        </div>
      </div>
    </motion.div>
  );
};