import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ApiKey } from '@/types/project';
import { ApiKeyService } from '@/lib/api/services';
import { useAuth } from '@/lib/context/useAuth';
import { toast } from 'sonner';
import {
  Copy, Info, KeyIcon, History, RefreshCw,
  CheckCircle2, Plus, Loader2,
} from 'lucide-react';
import { ApiKeyLogsDrawer } from '@/components/api-docs/ApiKeyLogsDrawer';
import { TwoFactorActionDialog } from '@/components/api-docs/TwoFactorActionDialog';
import { cn } from '@/lib/utils';

// ── Animation variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any } },
};

interface ApiKeyManagerProps {
  projectId: string;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ projectId }) => {
  const { user } = useAuth();
  const location = useLocation();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [tempNewKey, setTempNewKey] = useState<{ id: string; key: string } | null>(null);
  // Plaintext keys passed once via router state on app creation
  const [initialKeys, setInitialKeys] = useState<Record<string, string>>({});

  const [twoFactorDialog, setTwoFactorDialog] = useState<{
    isOpen: boolean;
    apiKeyId: string;
    action: 'copy' | 'unpause' | 'regenerate';
    title: string;
    description: string;
  }>({ isOpen: false, apiKeyId: '', action: 'copy', title: '', description: '' });

  const [logsDrawer, setLogsDrawer] = useState<{
    isOpen: boolean;
    apiKeyId: string | null;
    apiKeyName: string;
  }>({ isOpen: false, apiKeyId: null, apiKeyName: '' });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const keys = await ApiKeyService.listApiKeys(projectId);
      setApiKeys(keys);
      return true;
    } catch {
      toast.error('Failed to fetch API keys');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApiKeys(); }, [projectId]);

  // Seed plaintext keys from router navigation state (set once after app creation)
  useEffect(() => {
    const state = location.state as { sandboxKey?: string; productionKey?: string } | null;
    if (state?.sandboxKey || state?.productionKey) {
      const keys: Record<string, string> = {};
      if (state.sandboxKey) keys['sandbox'] = state.sandboxKey;
      if (state.productionKey) keys['production'] = state.productionKey;
      setInitialKeys(keys);
    }
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleGenerateKey = async (environment: 'sandbox' | 'production') => {
    const envLabel = environment === 'sandbox' ? 'Sandbox' : 'Production';
    setConfirmDialog({
      isOpen: true,
      title: `Generate ${envLabel} Key`,
      description: `This will generate a new ${envLabel} API key for this app. You will only be able to copy the full key once, immediately after generation.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        const pid = `generating-${environment}`;
        setIsProcessing(pid);
        try {
          const response = await ApiKeyService.generateApiKey(projectId, environment);
          setTempNewKey({ id: response.id, key: response.full_key });
          toast.success(`${envLabel} API key generated`);
          fetchApiKeys();
        } catch {
          toast.error('Failed to generate API key');
        } finally {
          setIsProcessing(null);
        }
      },
    });
  };

  const handleCopyClick = async (key: ApiKey) => {
    const tk = tempNewKey;
    if (tk && tk.id === key.id) {
      navigator.clipboard.writeText(tk.key);
      toast.success('Key copied to clipboard');
      return;
    }
    if (initialKeys[key.environment as string]) {
      navigator.clipboard.writeText(initialKeys[key.environment as string]);
      toast.success('Key copied to clipboard');
      return;
    }
    try {
      setIsProcessing(key.id);
      await ApiKeyService.requestOTP(projectId, key.id, user?.email || '');
      toast.info('Verification code sent to your email');
      setTwoFactorDialog({
        isOpen: true, apiKeyId: key.id, action: 'copy',
        title: 'Copy API Key',
        description: `To copy the full API key for "${key.name}", please verify your identity.`,
      });
    } catch {
      toast.error('Failed to request verification code');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRegenerateClick = async (key: ApiKey) => {
    setIsProcessing(key.id);
    try {
      await ApiKeyService.requestOTP(projectId, key.id, user?.email || '');
      toast.info('Verification code sent to your email');
      setTwoFactorDialog({
        isOpen: true, apiKeyId: key.id, action: 'regenerate',
        title: 'Roll API Key',
        description: 'This will revoke the current key and generate a new one. All integrations using the old key will stop working immediately.',
      });
    } catch {
      toast.error('Failed to request verification code');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRevokeClick = async (key: ApiKey) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke API Key',
      description: `Revoking "${key.name}" will immediately disable it. Any integrations using this key will stop working. This cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsProcessing(key.id);
        try {
          await ApiKeyService.revokeApiKey(projectId, key.id);
          toast.success('API Key revoked');
          await fetchApiKeys();
        } catch {
          toast.error('Failed to revoke API key');
        } finally {
          setIsProcessing(null);
        }
      },
    });
  };

  const handle2FASuccess = async (code: string) => {
    const { apiKeyId, action } = twoFactorDialog;
    setIsProcessing(apiKeyId);
    try {
      if (action === 'copy') {
        const fullKey = await ApiKeyService.verifyOTP(projectId, apiKeyId, code);
        navigator.clipboard.writeText(fullKey);
        toast.success('API Key copied to clipboard');
        setTwoFactorDialog(prev => ({ ...prev, isOpen: false }));
      } else if (action === 'regenerate') {
        await ApiKeyService.verifyOTP(projectId, apiKeyId, code);
        const currentKey = apiKeys.find(k => k.id === apiKeyId);
        const env = (currentKey?.environment || 'sandbox') as 'sandbox' | 'production';
        await ApiKeyService.revokeApiKey(projectId, apiKeyId);
        const response = await ApiKeyService.generateApiKey(projectId, env);
        setTempNewKey({ id: response.id, key: response.full_key });
        if (!response.is_active) {
          await ApiKeyService.toggleApiKey(projectId, response.id, true);
        }
        
        toast.success('API Key rolled successfully');
        setTwoFactorDialog(prev => ({ ...prev, isOpen: false }));
        await fetchApiKeys();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsProcessing(null);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────────
  const renderKeyCard = (type: 'sandbox' | 'production') => {
    const key = apiKeys.find(k => k.key_type === type || k.environment === type);
    const isLive = type === 'production';

    // ── Empty state ───────────────────────────────────────────────────────────
    if (!key) {
      const pid = `generating-${type}`;
      return (
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-12 text-center px-6">
            <div className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center mb-4',
              isLive ? 'bg-gp-sky-100' : 'bg-gp-cobalt-100',
            )}>
              <KeyIcon size={22} className={isLive ? 'text-gp-sky-600' : 'text-gp-cobalt'} />
            </div>
            <h3 className="font-display font-semibold text-text-xl text-gray-900 mb-1">
              {isLive ? 'Production' : 'Sandbox'} Key
            </h3>
            <p className="font-sans text-text-sm text-gray-500 max-w-[220px] mb-5">
              No {type} key yet. Generate one to start using this environment.
            </p>
            <motion.button
              onClick={() => handleGenerateKey(type)}
              disabled={isProcessing === pid}
              className="btn-gradient shimmer-surface h-9 px-5 rounded-xl text-white font-sans text-text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
              whileHover={isProcessing !== pid ? { scale: 1.02 } : {}}
              whileTap={isProcessing !== pid ? { scale: 0.97 } : {}}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {isProcessing === pid
                ? <><Loader2 size={14} className="animate-spin" />Generating…</>
                : <><Plus size={14} />Generate Key</>}
            </motion.button>
          </div>
        </motion.div>
      );
    }

    // ── Active key card ───────────────────────────────────────────────────────
    const isPaused = key.is_paused || !key.is_active;
    const plaintextKey =
      (tempNewKey?.id === key.id ? tempNewKey.key : null) ??
      initialKeys[type] ??
      null;
    const displayKey = plaintextKey
      ?? (key.masked_key || (key.key_prefix
        ? `${key.key_prefix}${'•'.repeat(28)}`
        : '•'.repeat(40)));

    return (
      <motion.div variants={itemVariants}>
        <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200">
          {/* Gradient accent bar */}
          <div className="h-0.5 w-full" style={{ background: 'var(--gradient-cta)' }} />

          <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5 px-5">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="font-display font-semibold text-text-xl text-gray-900">
                  {isLive ? 'Production Key' : 'Sandbox Key'}
                </CardTitle>
                {key.is_paused ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-text-xs font-medium bg-danger-light text-danger-fg">
                    Revoked
                  </span>
                ) : !key.is_active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-text-xs font-medium bg-warning-light text-warning-fg">
                    Inactive
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-sans text-text-xs font-medium bg-success-light text-success-fg">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Active
                  </span>
                )}
              </div>
              <p className="font-sans text-text-sm text-gray-500">
                {isLive ? 'For live transactions only' : 'Safe for testing and development'}
              </p>
            </div>
            <div className={cn(
              'h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0',
              isLive ? 'bg-gp-sky-100' : 'bg-gp-cobalt-100',
            )}>
              <KeyIcon size={16} className={isLive ? 'text-gp-sky-600' : 'text-gp-cobalt'} />
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5 space-y-4">
            {/* Key value */}
            <div className="bg-gp-slate-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
              <code className="font-mono text-text-sm text-gray-700 flex-1 truncate min-w-0 select-all">
                {displayKey}
              </code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleCopyClick(key)}
                      disabled={!!isProcessing && isProcessing === key.id}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors duration-150 flex-shrink-0"
                      whileHover={{ scale: 1.10 }}
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Copy size={13} />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-sans text-text-xs">Copy key</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Status toggle + actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Switch
                  id={`status-${key.id}`}
                  checked={key.is_active && !key.is_paused}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Activate a key (whether inactive or revoked)
                      setIsProcessing(key.id);
                      ApiKeyService.toggleApiKey(projectId, key.id, true)
                        .then(() => {
                          toast.success('API Key activated');
                          fetchApiKeys();
                        })
                        .catch(() => {
                          toast.error('Failed to activate API Key');
                        })
                        .finally(() => {
                          setIsProcessing(null);
                        });
                    } else {
                      // Revoke an active key
                      handleRevokeClick(key);
                    }
                  }}
                  disabled={!!isProcessing}
                />
                <label
                  htmlFor={`status-${key.id}`}
                  className={cn(
                    'font-sans text-text-sm cursor-pointer select-none',
                    key.is_paused ? 'text-gray-400' : 'text-gray-700 font-medium',
                  )}
                >
                  {key.is_paused ? 'Revoked' : key.is_active ? 'Enabled' : 'Inactive'}
                </label>
              </div>

              <div className="flex items-center gap-0.5">
                {/* Audit logs */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        onClick={() => setLogsDrawer({ isOpen: true, apiKeyId: key.id, apiKeyName: key.name })}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        whileHover={{ scale: 1.10 }}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <History size={15} />
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-sans text-text-xs">Audit logs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Roll key */}
                <motion.button
                  onClick={() => handleRegenerateClick(key)}
                  disabled={!!isProcessing}
                  className="h-8 px-3 rounded-lg flex items-center gap-1.5 font-sans text-text-sm font-medium text-danger-fg hover:bg-danger-light transition-colors duration-150 disabled:opacity-50"
                  whileHover={!isProcessing ? { scale: 1.04 } : {}}
                  whileTap={!isProcessing ? { scale: 0.94 } : {}}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <RefreshCw size={13} className={cn(isProcessing === key.id ? 'animate-spin' : '')} />
                  <span className="hidden sm:inline">Roll Key</span>
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[0, 1].map(i => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div className="h-0.5 skeleton" />
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="skeleton h-5 w-36 rounded-lg" />
                  <div className="skeleton h-4 w-52 rounded-md" />
                </div>
                <div className="skeleton h-9 w-9 rounded-xl" />
              </div>
              <div className="skeleton h-11 w-full rounded-xl" />
              <div className="skeleton h-8 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  const hasInitialKeys = Object.keys(initialKeys).length > 0;

  return (
    <>
      <div className="space-y-5">
        {/* Key cards — staggered entrance */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {renderKeyCard('sandbox')}
          {renderKeyCard('production')}
        </motion.div>

        {/* One-time keys banner */}
        {(tempNewKey || hasInitialKeys) && (
          <Alert className="border-l-4 bg-white border-success bg-success-light/40 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle className="font-sans font-semibold text-text-sm text-success-fg">
              {hasInitialKeys ? 'API Keys Generated' : 'New Key Generated'}
            </AlertTitle>
            <AlertDescription className="font-sans text-text-sm text-success-fg/80">
              Your {hasInitialKeys ? 'keys are' : 'key is'} shown above in full. Copy{hasInitialKeys ? ' them' : ' it'} now — once you leave or refresh this page they will be masked permanently.
            </AlertDescription>
          </Alert>
        )}

        {/* Security guidance */}
        <Alert className="border-l-4 bg-white border-gp-sky bg-info-light/40 rounded-xl">
          <Info className="h-4 w-4 text-gp-sky" />
          <AlertTitle className="font-sans font-semibold text-text-sm text-info-fg">
            Security note
          </AlertTitle>
          <AlertDescription className="font-sans text-text-sm text-info-fg/80">
            <ul className="list-disc list-inside space-y-0.5 mt-1">
              <li>Sensitive actions require email verification.</li>
              <li>Review audit logs regularly for unexpected access.</li>
              <li>Roll keys immediately if you suspect a leak.</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      <TwoFactorActionDialog
        isOpen={twoFactorDialog.isOpen}
        onClose={() => setTwoFactorDialog(prev => ({ ...prev, isOpen: false }))}
        apiKeyId={twoFactorDialog.apiKeyId}
        action={twoFactorDialog.action}
        title={twoFactorDialog.title}
        description={twoFactorDialog.description}
        onSuccess={handle2FASuccess}
      />

      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-semibold text-display-xs text-gray-900">
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-text-sm text-gray-500">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <AlertDialogCancel className="font-sans text-text-sm rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.onConfirm}
              className="btn-gradient text-white font-sans text-text-sm rounded-xl shadow-btn-gradient"
            >
              Confirm
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <ApiKeyLogsDrawer
        isOpen={logsDrawer.isOpen}
        onClose={() => setLogsDrawer(prev => ({ ...prev, isOpen: false }))}
        apiKeyId={logsDrawer.apiKeyId}
        apiKeyName={logsDrawer.apiKeyName}
      />
    </>
  );
};
