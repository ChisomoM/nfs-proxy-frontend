/**
 * Security Tab Component
 * Manages password changes, 2FA setup, and account security settings
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  LogOut,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePasswordForm, use2FAForm } from '../hooks/useProfileForm';
import { getRelativeTime, formatDate } from '@/lib/api/merchantProfileMocks';
import type { MerchantUser, LoginHistoryEntry } from '@/lib/api/merchantProfileAPI.types';

interface SecurityTabProps {
  user: MerchantUser;
  lastLogin?: LoginHistoryEntry;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ user, lastLogin }) => {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [twoFAEnabled] = useState(false); // Mock state

  const passwordForm = usePasswordForm();
  const twoFAForm = use2FAForm();

  // Handle password change
  const handleChangePassword = async () => {
    if (!passwordForm.validate()) return;

    setPasswordChanging(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setPasswordSuccess(true);
    setPasswordChanging(false);
    passwordForm.reset();
    setChangePasswordOpen(false);

    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  // Handle 2FA setup
  const handleSetup2FA = async () => {
    if (!twoFAForm.validate()) return;

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSetup2FAOpen(false);
    twoFAForm.reset();
  };

  // Password strength indicator
  const getStrengthColor = () => {
    switch (passwordForm.passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-blue-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthLabel = () => {
    return passwordForm.passwordStrength.charAt(0).toUpperCase() + passwordForm.passwordStrength.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Success Messages */}
      <AnimatePresence>
        {passwordSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-success-light px-4 py-3 rounded-lg border border-success"
          >
            <CheckCircle className="h-5 w-5 text-success-fg flex-shrink-0" />
            <p className="text-sm font-medium text-success-fg">Password changed successfully</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Status Card */}
      <Card className="border-gradient bg-gradient-to-br from-green-50 to-white card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Account Status</h3>
              <p className="text-sm text-gray-500 mt-1">Your account is secure and active</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-gp-sky" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Update your password regularly to keep your account secure. Minimum 8 characters required.
          </p>
          <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn-gradient text-white font-medium px-4 py-2.5 rounded-lg"
              >
                Change Password
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one. Minimum 8 characters.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.formData.currentPassword}
                      onChange={(e) => passwordForm.handleChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                      disabled={passwordChanging}
                      className={passwordForm.errors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords(prev => ({ ...prev, current: !prev.current }))
                      }
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.errors.currentPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.errors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.formData.newPassword}
                      onChange={(e) => passwordForm.handleChange('newPassword', e.target.value)}
                      placeholder="Enter new password (min. 8 characters)"
                      disabled={passwordChanging}
                      className={passwordForm.errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.errors.newPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.errors.newPassword}</p>
                  )}

                  {/* Password Strength Indicator */}
                  {passwordForm.formData.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getStrengthColor()}`}
                            style={{
                              width: {
                                weak: '25%',
                                fair: '50%',
                                good: '75%',
                                strong: '100%',
                              }[passwordForm.passwordStrength],
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {getStrengthLabel()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.formData.confirmPassword}
                      onChange={(e) => passwordForm.handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter new password"
                      disabled={passwordChanging}
                      className={passwordForm.errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))
                      }
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordForm.errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleChangePassword}
                  disabled={passwordChanging}
                  className="flex-1 btn-gradient text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
                >
                  {passwordChanging ? 'Updating...' : 'Update Password'}
                </motion.button>
                <button
                  onClick={() => setChangePasswordOpen(false)}
                  disabled={passwordChanging}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* 2FA Card */}
      <Card className="border-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-gp-sky" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Add an extra layer of security to your account. We'll send a code to your email when you log in.
          </p>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              {twoFAEnabled ? (
                <Badge variant="success">Enabled</Badge>
              ) : (
                <Badge variant="warning">Disabled</Badge>
              )}
            </div>
            <p className="text-xs text-gray-600">Sent to {user.email}</p>
          </div>

          <Dialog open={setup2FAOpen} onOpenChange={setSetup2FAOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white border border-gp-sky text-gp-sky font-medium px-4 py-2.5 rounded-lg hover:bg-gp-sky-50"
              >
                {twoFAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  We'll send a 6-digit code to your email each time you log in
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <span className="font-semibold">How it works:</span> After entering your password, we'll send a 6-digit code to your registered email. Enter this code to complete login.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Enter OTP sent to <span className="font-mono text-xs">{user.email}</span>
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={twoFAForm.otp}
                    onChange={(e) => twoFAForm.handleChange(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    disabled={passwordChanging}
                    className="text-center text-2xl tracking-widest font-mono"
                  />
                  {twoFAForm.error && (
                    <p className="text-xs text-red-500 mt-1">{twoFAForm.error}</p>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Didn't receive the code? <button className="text-gp-sky font-medium hover:underline">Resend</button>
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSetup2FA}
                  disabled={passwordChanging}
                  className="flex-1 btn-gradient text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
                >
                  {passwordChanging ? 'Verifying...' : 'Verify & Enable'}
                </motion.button>
                <button
                  onClick={() => setSetup2FAOpen(false)}
                  disabled={passwordChanging}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Last Login */}
      {lastLogin && (
        <Card className="border-gradient bg-gradient-to-br from-gray-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-gray-600" />
              Last Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date & Time</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatDate(lastLogin.timestamp)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Relative Time</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {getRelativeTime(lastLogin.timestamp)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Device</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{lastLogin.device}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {lastLogin.location || 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityTab;
