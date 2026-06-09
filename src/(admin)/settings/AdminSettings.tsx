import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, TrendingUp, Activity, Key, File, Cloud } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { PageHeader } from '@/components/shared/PageHeader'
import AdminAccountTab from './components/AdminAccountTab'
import AdminSecurityTab from './components/AdminSecurityTab'
import AdminUsageTab from './components/AdminUsageTab'
import AdminActivityTab from './components/AdminActivityTab'
import AdminIntegrations from './components/AdminIntegrations'
import AdminTemplatesTab from './components/AdminTemplatesTab'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'templates', label: 'Templates', icon: File },
  { id: 'configurations', label: 'Configurations', icon: Cloud },
] as const

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('account')

  let activeTabContent: JSX.Element | null = null
  if (activeTab === 'account') {
    activeTabContent = <AdminAccountTab />
  } else if (activeTab === 'security') {
    activeTabContent = <AdminSecurityTab />
  } else if (activeTab === 'activity') {
    activeTabContent = <AdminActivityTab />
  } else if (activeTab === 'templates') {
    activeTabContent = <AdminTemplatesTab />
  } else if (activeTab === 'configurations') {
    activeTabContent = <AdminIntegrations />
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader title="Settings" subtitle="Configure platform-wide settings for GeePay NFS." />

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
        {activeTabContent}
      </motion.div>
    </PageTransition>
  )
}
