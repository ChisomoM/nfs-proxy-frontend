/**
 * Merchant Profile Page
 * Main page component with tabbed interface for account management
 * Tabs: Account, Security, Usage & Charges, Activity
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, TrendingUp, Activity, Key, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/context/useAuth';
import { cn } from '@/lib/utils';
import { MOCK_MERCHANT_PROFILE } from '@/lib/api/merchantProfileMocks';
import { ProjectService } from '@/lib/api/services';
import AccountTab from './components/AccountTab';
import SecurityTab from './components/SecurityTab';
import UsageTab from './components/UsageTab';
import ActivityTab from './components/ActivityTab';
import { ApiKeyManager } from './api-keys/ApiKeyManager';
import { AppParticipantManager } from './api-keys/AppParticipantManager';

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'usage', label: 'Usage', icon: TrendingUp },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'participants', label: 'Participants', icon: Users },
] as const;

export const MerchantSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('account');
  const [canonicalAppId, setCanonicalAppId] = useState<string | null>(null);
  const [appSetupError, setAppSetupError] = useState<string | null>(null);
  const [isSettingUpApp, setIsSettingUpApp] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        const projects = await ProjectService.getProjects();
        if (projects.length > 0) {
          setCanonicalAppId(projects[0].id);
        } else {
          // Auto-create a default app so merchants don't need to know the concept exists
          const created = await ProjectService.createProject({
            name: 'Default',
            description: '',
            app_type: 'integration',
          });
          setCanonicalAppId(created.id);
        }
      } catch {
        setAppSetupError('Failed to load API settings. Please refresh the page.');
      } finally {
        setIsSettingUpApp(false);
      }
    };
    setup();
  }, []);

  // Use live user data from auth context, with fallback for usage/activity mock data
  const profileData = useMemo(() => {
    if (!user) return MOCK_MERCHANT_PROFILE;

    return {
      user: {
        id: user.id || 0,
        firstName: user.firstName || user.first_name || 'User',
        lastName: user.lastName || user.last_name || '',
        email: user.email || '',
        mobile: user.mobile || undefined,
        profileImage: (user as any).profileImage || (user as any).picture || (user as any).avatar || undefined,
        accountType: user.accountType || 'merchant' as const,
        status: user.isActive !== false ? ('active' as const) : ('pending' as const),
        createdAt: MOCK_MERCHANT_PROFILE.user.createdAt,
        lastLoginDate: user.last_login_date,
        isVerified: user.isVerified !== false,
      },
      usage: MOCK_MERCHANT_PROFILE.usage,
      activity: MOCK_MERCHANT_PROFILE.activity,
    };
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="font-display font-bold text-display-sm text-gray-900">
          Account & Settings
        </h1>
        <p className="text-text-md text-gray-500 mt-1">
          Manage your merchant account, security, and billing information
        </p>
      </motion.div>

      {/* Tab Navigation*/}
      <div className="py-4 px-4 bg-white rounded-2xl mb-6">
        <div className="flex items-center gap-4">
          {/* <p className="font-sans text-text-xs text-gray-500 font-medium uppercase tracking-wider flex-shrink-0">
            Account Section
          </p> */}
          <motion.div className="flex bg-slate-50/80 p-1 rounded-xl gap-0.5">
            {TABS.map(({ id, label, icon: IconComponent }) => (
              <motion.button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-text-xs font-medium transition-colors duration-150 outline-none',
                  activeTab === id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <IconComponent size={16} />
                <span>{label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {activeTab === 'account' && <AccountTab user={profileData.user} />}
        {activeTab === 'security' && (
          <SecurityTab user={profileData.user} lastLogin={profileData.activity.recentLogins[0]} />
        )}
        {activeTab === 'usage' && <UsageTab usage={profileData.usage} />}
        {activeTab === 'activity' && <ActivityTab />}
        {(activeTab === 'api-keys' || activeTab === 'participants') && (
          appSetupError ? (
            <div className="flex items-center justify-center gap-2 py-16 text-danger-fg font-sans text-text-sm">
              <AlertCircle size={16} />
              {appSetupError}
            </div>
          ) : isSettingUpApp || !canonicalAppId ? (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400 font-sans text-text-sm">
              <Loader2 size={16} className="animate-spin" />
              Setting up…
            </div>
          ) : activeTab === 'api-keys' ? (
            <ApiKeyManager projectId={canonicalAppId} />
          ) : (
            <AppParticipantManager projectId={canonicalAppId} />
          )
        )}
      </motion.div>
    </motion.div>
  );
};

export default MerchantSettings;
