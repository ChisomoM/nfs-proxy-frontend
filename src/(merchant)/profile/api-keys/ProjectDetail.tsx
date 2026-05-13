import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Layers,
  Copy,
  ExternalLink,
  Settings,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ProjectService } from '@/lib/api/services';
import { ApiKeyManager } from './ApiKeyManager';
import { AppParticipantManager } from './AppParticipantManager';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import type { EmoneyTransactionType } from '@/types/transaction';
import { TRANSACTION_TYPE_LABELS } from '@/types/transaction';

// Mock transaction data for "Recent Transactions" section
interface MockTransaction {
  id: string;
  type: EmoneyTransactionType;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  account?: string;
}

const mockProjectTransactions: MockTransaction[] = [
  {
    id: 'TXN-001',
    type: 'CashIn',
    amount: 5000,
    status: 'completed',
    timestamp: '2024-01-15 14:30',
    account: 'John Doe',
  },
  {
    id: 'TXN-002',
    type: 'CashOut',
    amount: 2500,
    status: 'pending',
    timestamp: '2024-01-15 13:15',
    account: 'Jane Smith',
  },
  {
    id: 'TXN-003',
    type: 'FundTransfer',
    amount: 1200,
    status: 'completed',
    timestamp: '2024-01-15 12:00',
    account: 'Bob Johnson',
  },
  {
    id: 'TXN-004',
    type: 'Reversal',
    amount: 500,
    status: 'failed',
    timestamp: '2024-01-15 11:42',
    account: 'Mary Banda',
  },
];

interface ProjectDetailProps {
  projectId: string;
  onBack?: () => void;
  initialTab?: 'overview' | 'participants' | 'settings';
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack, initialTab = 'overview' }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'settings'>(initialTab);

  const TABS = [
    { id: 'overview' as const, label: 'Overview', icon: TrendingUp },
    { id: 'participants' as const, label: 'Participants', icon: Users },
    { id: 'settings' as const, label: 'API Keys & Settings', icon: Settings },
  ] as const;

  useEffect(() => {
    const fetchProjectDetailsAsync = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ProjectService.getProject(projectId);
        setProject(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load project details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetailsAsync();
  }, [projectId]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getTransactionStatusStyles = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-success-light', text: 'text-success-fg', icon: CheckCircle };
      case 'pending':
        return { bg: 'bg-warning-light', text: 'text-warning-fg', icon: Clock };
      case 'failed':
        return { bg: 'bg-danger-light', text: 'text-danger-fg', icon: AlertCircle };
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="space-y-5"
      >
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
          <div className="h-[3px] skeleton" />
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="skeleton h-14 w-14 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="skeleton h-7 w-56 rounded-xl" />
                <div className="skeleton h-4 w-96 rounded-md" />
              </div>
              <div className="skeleton h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="skeleton h-11 w-[400px] rounded-xl" />
        <div className="rounded-2xl bg-white border border-gray-100 p-6 space-y-4">
          <div className="skeleton h-6 w-40 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-24 rounded-md" />
                <div className="skeleton h-5 w-48 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Error State
  if (error || !project) {
    const handleRetry = () => {
      setIsLoading(true);
      setError(null);
      ProjectService.getProject(projectId)
        .then(setProject)
        .catch((err) => {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load app details';
          setError(errorMessage);
          toast.error(errorMessage);
        })
        .finally(() => setIsLoading(false));
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl bg-white border border-gray-100 p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="flex justify-center mb-5"
        >
          <div className="p-4 rounded-2xl" style={{ background: 'var(--gradient-cta)' }}>
            <Layers className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </motion.div>
        <h3 className="font-display font-semibold text-display-xs text-gray-900 mb-2">
          {error ? 'Error Loading App' : 'App Not Found'}
        </h3>
        <p className="font-sans text-text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          {error || "The app you're looking for doesn't exist or has been removed."}
        </p>
        <div className="flex gap-3 justify-center">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="font-sans text-text-sm rounded-xl border-gray-200"
            >
              ← Back to Apps
            </Button>
          )}
          {error && (
            <motion.button
              onClick={handleRetry}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gradient shimmer-surface h-10 px-5 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient"
            >
              Try Again
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // Main Content
  return (
    <div className="space-y-6">
      {/* App header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="bg-gradient-to-br from-white to-gp-cobalt-50/30 border border-gp-cobalt-100/60 rounded-2xl overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-gp-cobalt via-[#2b6fc2] to-gp-sky" />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--gradient-cta)' }}
                >
                  <span className="font-display font-bold text-display-xs text-white">
                    {(project.name?.[0] ?? 'A').toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="font-display font-bold text-display-sm text-gradient-brand tracking-tight">
                      {project.name}
                    </h1>
                    {project.primary_environment && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-text-xs font-medium bg-gp-slate-100 text-gp-slate-600">
                        {project.primary_environment === 'sandbox' ? 'Sandbox' : 'Production'}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-text-sm text-gray-500 max-w-xl">
                    {project.description || <span className="italic text-gray-300">No description</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-text-sm font-medium',
                    project.is_active
                      ? 'bg-success-light text-success-fg'
                      : 'bg-gp-slate-100 text-gp-slate-500'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      project.is_active ? 'bg-success live-dot' : 'bg-gp-slate-400'
                    )}
                  />
                  {project.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation Bar - Profile Style */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="py-3 px-4 bg-white rounded-2xl border border-gray-100"
      >
        <motion.div className="flex bg-slate-50/80 p-1 rounded-xl gap-0.5 w-fit">
          {TABS.map(({ id, label, icon: IconComponent }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-text-xs font-medium transition-colors duration-150 outline-none',
                activeTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-5"
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* App Details Card */}
            <Card className="bg-white border border-gray-100 rounded-2xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">App Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* App ID */}
                  <div>
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide">
                      App ID
                    </label>
                    <div className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 border border-gray-100 transition-all duration-150 hover:border-gp-cobalt-100">
                      <p className="font-mono text-text-sm text-gray-700 break-all select-all flex-1">
                        {project.id}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(project.id, 'App ID')}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gp-cobalt-50 text-gray-400 hover:text-gp-cobalt transition-colors"
                        title="Copy App ID"
                      >
                        <Copy size={14} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Created On */}
                  <div>
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Created On
                    </label>
                    <p className="font-sans text-text-sm text-gray-900 mt-2">{formatDate(project.created_at)}</p>
                  </div>
                </div>

                {/* Webhook URL */}
                {project.webhook_url && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                      Webhook URL
                    </label>
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 border border-gray-100 hover:border-gp-cobalt-100 transition-colors">
                      <p className="font-mono text-text-sm text-gp-cobalt break-all flex-1">
                        {project.webhook_url}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(project.webhook_url!, 'Webhook URL')}
                          className="p-1.5 rounded-lg hover:bg-gp-cobalt-50 text-gray-400 hover:text-gp-cobalt transition-colors"
                          title="Copy webhook URL"
                        >
                          <Copy size={14} />
                        </motion.button>
                        <motion.a
                          href={project.webhook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-1.5 rounded-lg hover:bg-gp-sky-100 text-gray-400 hover:text-gp-sky transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink size={14} />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions Card */}
            <Card className="bg-white border border-gray-100 rounded-2xl">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {mockProjectTransactions.map((txn) => {
                    const statusStyles = getTransactionStatusStyles(txn.status);
                    const StatusIcon = statusStyles.icon;
                    return (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn('p-2 rounded-lg', statusStyles.bg)}>
                            <StatusIcon size={16} className={statusStyles.text} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-text-sm font-medium text-gray-900">
                              {TRANSACTION_TYPE_LABELS[txn.type]}
                            </p>
                            <p className="font-sans text-text-xs text-gray-500">
                              {txn.account} • {txn.timestamp}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-sans text-text-sm font-semibold text-gray-900">
                            ZMW {txn.amount.toLocaleString()}
                          </span>
                          <span
                            className={cn(
                              'text-text-xs font-medium px-2 py-1 rounded-full',
                              statusStyles.bg,
                              statusStyles.text
                            )}
                          >
                            {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && <AppParticipantManager projectId={projectId} />}

        {/* API Keys & Settings Tab */}
        {activeTab === 'settings' && (
          <>
            {/* API Keys Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Keys</h3>
              <ApiKeyManager projectId={projectId} />
            </div>

            {/* Danger Zone */}
            <Card className="bg-white border border-red-100 rounded-2xl overflow-hidden">
              <div className="h-[3px] w-full bg-gradient-to-r from-red-500 to-red-400" />
              <CardHeader className="border-b border-red-100">
                <CardTitle className="text-lg font-semibold text-danger-fg">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-sans text-text-sm text-gray-500 mb-4">
                  Deleting this app is permanent and cannot be undone. All API keys and associated data
                  will be removed immediately.
                </p>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="font-sans text-text-sm border border-red-200 text-danger hover:bg-danger-light hover:text-danger-fg rounded-lg px-4 py-2 transition-colors duration-200"
                >
                  Delete App
                </motion.button>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
};
