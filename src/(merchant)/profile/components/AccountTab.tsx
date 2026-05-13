/**
 * Account Tab Component
 * Displays user information with inline edit capability
 * Fields: First Name, Last Name, Email (read-only), Mobile
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Edit2, Save, X, CheckCircle } from 'lucide-react';
import { useProfileForm } from '../hooks/useProfileForm';
import { getInitials } from '@/lib/api/merchantProfileMocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { MerchantUser } from '@/lib/api/merchantProfileAPI.types';

interface AccountTabProps {
  user: MerchantUser;
}

const AccountTab: React.FC<AccountTabProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useProfileForm({
    firstName: user.firstName,
    lastName: user.lastName,
    mobile: user.mobile || '',
  });

  const handleSave = async () => {
    if (!form.validate()) return;

    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSaveSuccess(true);
    setIsSaving(false);
    setIsEditing(false);

    // Hide success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    setSaveSuccess(false);
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 bg-success-light px-4 py-3 rounded-lg border border-success"
        >
          <CheckCircle className="h-5 w-5 text-success-fg flex-shrink-0" />
          <p className="text-sm font-medium text-success-fg">Profile updated successfully</p>
        </motion.div>
      )}

      {/* Avatar Card */}
      <Card className="border-gradient bg-gradient-to-br from-gray-50 to-white card-glow">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {user.profileImage && <AvatarImage src={user.profileImage} />}
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-gp-sky to-gp-cobalt text-white">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge variant="outline" className="mt-2">
                {user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card className="border-gradient">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200">
          <CardTitle className="text-lg">Account Information</CardTitle>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gp-sky hover:bg-gp-sky-50 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </motion.button>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {!isEditing ? (
            // View Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">First Name</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Name</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{user.lastName}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{user.email}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {user.mobile ? user.mobile : '—'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Status</p>
                  <Badge
                    variant={user.status === 'active' ? 'success' : 'warning'}
                    className="mt-1"
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(user.createdAt).toLocaleDateString('en-ZM', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                    First Name
                  </label>
                  <Input
                    value={form.formData.firstName}
                    onChange={(e) => form.handleChange('firstName', e.target.value)}
                    placeholder="First name"
                    className={form.errors.firstName ? 'border-red-500' : ''}
                    disabled={isSaving}
                  />
                  {form.errors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{form.errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                    Last Name
                  </label>
                  <Input
                    value={form.formData.lastName}
                    onChange={(e) => form.handleChange('lastName', e.target.value)}
                    placeholder="Last name"
                    className={form.errors.lastName ? 'border-red-500' : ''}
                    disabled={isSaving}
                  />
                  {form.errors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{form.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                  Phone Number (Optional)
                </label>
                <Input
                  value={form.formData.mobile}
                  onChange={(e) => form.handleChange('mobile', e.target.value)}
                  placeholder="+260123456789"
                  disabled={isSaving}
                  className={form.errors.mobile ? 'border-red-500' : ''}
                />
                {form.errors.mobile && (
                  <p className="text-xs text-red-500 mt-1">{form.errors.mobile}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={!form.isDirty || isSaving}
                  className="flex-1 flex items-center justify-center gap-2 btn-gradient text-white font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <div className="bg-gp-sky-50 border border-gp-sky-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gp-sky-700">
          <span className="font-semibold">Note:</span> Email address cannot be changed. If you need to update your email, please contact support.
        </p>
      </div>
    </div>
  );
};

export default AccountTab;
