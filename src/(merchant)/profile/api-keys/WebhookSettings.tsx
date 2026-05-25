import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Webhook as WebhookIcon, Copy, Edit2, Check, X } from 'lucide-react';
import { ProjectService } from '@/lib/api/services';
import type { Project } from '@/types/project';

interface WebhookSettingsProps {
  projectId: string;
}

const WebhookSettings: React.FC<WebhookSettingsProps> = ({ projectId }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await ProjectService.getProject(projectId);
        setProject(p);
        setWebhookUrl(p.webhook_url || '');
      } catch {
        // silent — parent context may show errors elsewhere
      }
    };
    if (projectId) load();
  }, [projectId]);

  const handleSave = async () => {
    if (!webhookUrl.trim() && !project?.webhook_url) {
      toast.error('Webhook URL cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await ProjectService.updateProject(projectId, { webhook_url: webhookUrl || '' });
      setProject(updated);
      toast.success('Webhook URL updated successfully');
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update webhook URL';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setWebhookUrl(project?.webhook_url || '');
    setIsEditing(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Webhook URL copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100">
              <WebhookIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Webhook URL</CardTitle>
              <p className="font-sans text-text-xs text-gray-500 mt-1">
                Receive transaction event notifications at this URL
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            {project?.webhook_url ? (
              <>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <span className="font-mono text-text-sm text-gray-700 flex-1 truncate">
                    {project.webhook_url}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(project.webhook_url!)}
                      className="p-2 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy URL"
                    >
                      <Copy size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit URL"
                    >
                      <Edit2 size={16} />
                    </motion.button>
                  </div>
                </div>
                <p className="font-sans text-text-xs text-gray-500">
                  We'll POST transaction events to this endpoint as they complete. Must be HTTPS and publicly accessible.
                </p>
              </>
            ) : (
              <>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="font-sans text-text-sm text-gray-500">No webhook URL configured</p>
                </div>
                <p className="font-sans text-text-xs text-gray-500">
                  Set a webhook URL to receive real-time notifications for async transactions (FundTransfer, NameLookup).
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="btn-gradient shimmer-surface h-10 px-4 rounded-lg text-white font-sans text-text-sm font-semibold"
                >
                  Set Webhook URL
                </motion.button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook_url" className="font-sans text-text-sm font-medium text-gray-700">
                Webhook URL
              </Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://your-api.example.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={isSaving}
                className="font-sans text-text-sm rounded-xl border-gray-200 focus:border-gp-cobalt focus:ring-2 focus:ring-gp-cobalt/20"
                autoFocus
              />
              <p className="font-sans text-text-xs text-gray-500">
                Must be a valid HTTPS URL and publicly accessible. We'll send POST requests with transaction data.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={isSaving}
                className="h-10 px-4 rounded-lg border border-gray-200 text-gray-600 font-sans text-text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                <X size={16} className="inline-block mr-2" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="btn-gradient shimmer-surface h-10 px-4 rounded-lg text-white font-sans text-text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookSettings;
