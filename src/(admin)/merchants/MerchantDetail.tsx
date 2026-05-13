import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, Loader2, ScrollText } from 'lucide-react';
import { MerchantService } from '@/lib/api/services';
import { fetchData } from '@/lib/api/crud';
import { cn } from '@/lib/utils';
import type { Merchant } from '@/types/merchant';
import type { AuditTrail } from '@/types/audit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableHeaderRow, TableRow, SortableTableHead,
} from '@/components/ui/table';
import { EditMerchantDialog } from './components/EditMerchantDialog';
import { DeleteMerchantDialog } from './components/DeleteMerchantDialog';
import { useTableSort } from '@/hooks/useTableSort';

interface MerchantDetailProps {
  merchantId: string;
  onBack?: () => void;
}

export const MerchantDetail: React.FC<MerchantDetailProps> = ({
  merchantId,
  onBack,
}) => {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchMerchantAsync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await MerchantService.getMerchant(merchantId);
      setMerchant(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load merchant details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchMerchantAsync();
  }, [fetchMerchantAsync]);

  const fetchAuditTrails = useCallback(async () => {
    if (!merchantId) return;
    setAuditLoading(true);
    try {
      const data = await fetchData('ADMIN_AUDIT_TRAILS', 'GET', {}, null, { merchant_id: merchantId });
      setAuditTrails(Array.isArray(data) ? data : []);
    } catch {
      // silently fail — audit is non-critical
    } finally {
      setAuditLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    if (activeTab === 'activity') fetchAuditTrails();
  }, [activeTab, fetchAuditTrails]);

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

  const handleToggleStatus = async () => {
    if (!merchant || isUpdatingStatus || isLoading) return;
    const newStatus = merchant.status === 'active' ? 'suspended' : 'active';
    setIsUpdatingStatus(true);
    try {
      await MerchantService.updateMerchantStatus(merchantId, newStatus);
      setMerchant(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Merchant ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update merchant status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        {/* Header skeleton */}
        <div className="rounded-2xl bg-white border-gradient shadow-sm overflow-hidden">
          <div className="h-0.5 skeleton" />
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="skeleton h-14 w-14 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="skeleton h-7 w-56 rounded-xl" />
                <div className="skeleton h-4 w-96 rounded-md" />
              </div>
            </div>
          </div>
        </div>
        {/* Tabs skeleton */}
        <div className="skeleton h-10 w-80 rounded-xl" />
        <div className="rounded-2xl bg-white border-gradient shadow-sm p-6 space-y-4">
          <div className="skeleton h-5 w-40 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0,1,2,3].map(i => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-24 rounded-md" />
                <div className="skeleton h-5 w-48 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    const handleRetry = () => {
      fetchMerchantAsync();
    };

    return (
      <div className="rounded-2xl bg-white border-gradient shadow-sm p-12 text-center">
        <div className="flex justify-center mb-5">
          <div className="p-4 bg-danger-light rounded-2xl">
            <Building2 className="w-10 h-10 text-danger-fg" />
          </div>
        </div>
        <h3 className="font-display font-semibold text-display-xs text-gray-900 mb-2">
          {error ? 'Error Loading Merchant' : 'Merchant Not Found'}
        </h3>
        <p className="font-sans text-text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          {error || "The merchant you're looking for doesn't exist or has been removed."}
        </p>
        <div className="flex gap-3 justify-center">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="font-sans text-text-sm rounded-xl border-gray-200"
            >
              ← Back to Merchants
            </Button>
          )}
          {error && (
            <button
              onClick={handleRetry}
              className="btn-gradient shimmer-surface h-10 px-5 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Merchant header card */}
      <Card className="bg-white border-gradient shadow-sm rounded-2xl overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-gp-cobalt via-[#2b6fc2] to-gp-sky" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Merchant avatar */}
              <div className="h-14 w-14 rounded-2xl bg-gp-cobalt-100 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-display-xs text-gp-cobalt">
                  {merchant.business_name?.substring(0, 2).toUpperCase() ?? 'M'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="font-display font-bold text-display-sm text-gradient-brand tracking-tight">
                    {merchant.business_name}
                  </h1>
                </div>
                <p className="font-sans text-text-sm text-gray-500 max-w-xl">
                  {merchant.participant_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-text-sm font-medium',
                merchant.status === 'active'
                  ? 'bg-success-light text-success-fg'
                  : merchant.status === 'suspended'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gp-slate-100 text-gp-slate-500',
              )}>
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  merchant.status === 'active'
                    ? 'bg-success'
                    : merchant.status === 'suspended'
                    ? 'bg-orange-400'
                    : 'bg-gp-slate-400',
                )} />
                {merchant.status === 'active' ? 'Active' : merchant.status === 'suspended' ? 'Suspended' : 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex flex-col space-y-6">
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[560px] rounded-xl bg-gp-slate-100 p-1">
            <TabsTrigger
              value="overview"
              className="font-sans text-text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-gp-cobalt data-[state=active]:shadow-xs"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="font-sans text-text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-gp-cobalt data-[state=active]:shadow-xs inline-flex items-center gap-1.5"
            >
              <ScrollText size={14} />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="font-sans text-text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-gp-cobalt data-[state=active]:shadow-xs"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-5 mt-5">
            <Card className="bg-white border-gradient shadow-sm rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="font-display font-semibold text-display-xs text-gray-900">
                  Merchant Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Merchant ID */}
                  <div>
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide">Merchant ID</label>
                    <div className="mt-1.5 bg-gp-slate-50 rounded-xl px-3 py-2 border border-gray-100">
                      <p className="font-mono text-text-sm text-gray-700 break-all select-all">{merchant.ext_id}</p>
                    </div>
                  </div>

                  {/* Participant ID */}
                  <div>
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide">Participant ID</label>
                    <div className="mt-1.5 bg-gp-slate-50 rounded-xl px-3 py-2 border border-gray-100">
                      <code className="font-mono text-text-sm text-gray-700 break-all">
                        {merchant.participant_id}
                      </code>
                    </div>
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Email</label>
                    <p className="font-sans text-text-sm text-gray-900 mt-1.5">
                      {merchant.contact_details?.email ? (
                        <a href={`mailto:${merchant.contact_details.email}`} className="text-gp-cobalt hover:underline">
                          {merchant.contact_details.email}
                        </a>
                      ) : (
                        <span className="italic text-gray-400">—</span>
                      )}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                    <div className="mt-1.5">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-text-xs font-medium',
                        merchant.status === 'active'
                          ? 'bg-success-light text-success-fg'
                          : merchant.status === 'suspended'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gp-slate-100 text-gp-slate-500',
                      )}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          merchant.status === 'active'
                            ? 'bg-success'
                            : merchant.status === 'suspended'
                            ? 'bg-orange-400'
                            : 'bg-gp-slate-400',
                        )} />
                        {merchant.status === 'active' ? 'Active' : merchant.status === 'suspended' ? 'Suspended' : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Created On */}
                  <div>
                    <label className="font-sans text-text-xs font-medium text-gray-500 uppercase tracking-wide">Created On</label>
                    <p className="font-sans text-text-sm text-gray-900 mt-1.5">{formatDate(merchant.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity tab — audit trail scoped to this merchant */}
          <TabsContent value="activity" className="space-y-5 mt-5">
            <MerchantAuditPanel
              trails={auditTrails}
              loading={auditLoading}
              search={auditSearch}
              onSearchChange={setAuditSearch}
            />
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="space-y-5 mt-5">
            <Card className="bg-white border border-danger/20 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="font-display font-semibold text-text-lg text-danger-fg">
                  Merchant Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Edit Merchant */}
                  <div>
                    <p className="font-sans text-text-sm text-gray-500 mb-3">
                      Update merchant information including business name and contact details.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowEditDialog(true)}
                      className="font-sans text-text-sm rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    >
                      Edit Merchant Details
                    </Button>
                  </div>

                  {/* Suspend/Activate */}
                  <div>
                    <p className="font-sans text-text-sm text-gray-500 mb-3">
                      {merchant.status === 'active'
                        ? 'Suspend this merchant to temporarily disable their account and prevent new transactions.'
                        : 'Activate this merchant to restore their account access and enable transactions.'}
                    </p>
                    <Button
                      variant="outline"
                      disabled={isUpdatingStatus}
                      onClick={handleToggleStatus}
                      className={cn(
                        "font-sans text-text-sm rounded-xl inline-flex items-center gap-2",
                        merchant.status === 'active'
                          ? "border-danger/30 text-danger hover:bg-danger-light hover:text-danger-fg"
                          : "border-success/30 text-success-fg hover:bg-success-light"
                      )}
                    >
                      {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                      {merchant.status === 'active' ? 'Suspend Merchant' : 'Activate Merchant'}
                    </Button>
                  </div>

                  {/* Delete Merchant */}
                  <div className="border-t border-danger/20 pt-4">
                    <p className="font-sans text-text-sm text-danger-fg mb-3">
                      <strong>Danger Zone:</strong> Soft-delete this merchant. They will be hidden from all lists but their data will be preserved for audit purposes.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="font-sans text-text-sm rounded-xl"
                    >
                      Delete Merchant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <EditMerchantDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        merchant={merchant}
        onSuccess={fetchMerchantAsync}
      />

      <DeleteMerchantDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        merchant={merchant}
        onSuccess={() => {
          if (onBack) onBack();
        }}
      />
    </motion.div>
  );
};

// ─── Inline audit panel component ────────────────────────────────────────────

interface MerchantAuditPanelProps {
  trails: AuditTrail[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
}

const formatAuditDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const getRelativeAuditTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const statusClass = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-700';
  if (status >= 400) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
};

const MerchantAuditPanel: React.FC<MerchantAuditPanelProps> = ({ trails, loading, search, onSearchChange }) => {
  const filtered = trails.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.action.toLowerCase().includes(q) || (t.session_id || '').toLowerCase().includes(q) || t.actor_email.toLowerCase().includes(q);
  });

  const { sorted, sortColumn, sortDirection, handleSort } = useTableSort(filtered);

  const exportCSV = () => {
    const header = 'Timestamp,Action,Status,Actor Email,IP,Duration,Session ID\n';
    const rows = trails.map(t =>
      [formatAuditDate(t.created_at), t.action, t.status, t.actor_email, t.ip, `${(t.time_elapsed * 1000).toFixed(0)}ms`, t.session_id || ''].join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'merchant-audit.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="skeleton h-48 w-full rounded-2xl" />;
  }

  return (
    <Card className="bg-white border-gradient shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <div>
          <CardTitle className="font-display font-semibold text-display-xs text-gray-900">Audit Trail</CardTitle>
          <p className="font-sans text-text-xs text-gray-500 mt-0.5">{trails.length} event{trails.length !== 1 ? 's' : ''} recorded for this merchant</p>
        </div>
        <button onClick={exportCSV} className="text-gp-sky font-sans text-text-xs font-medium hover:underline whitespace-nowrap">
          Export CSV
        </button>
      </CardHeader>

      <div className="px-6 pb-3">
        <input
          type="text"
          placeholder="Search by action, session or email..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full h-9 rounded-xl border border-gray-200 bg-gp-slate-50 px-3 font-sans text-text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gp-cobalt/20"
        />
      </div>

      <div className="overflow-x-auto">
        {sorted.length === 0 ? (
          <div className="py-12 text-center font-sans text-text-sm text-gray-400">No audit events recorded yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <SortableTableHead sortKey="created_at" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Timestamp</SortableTableHead>
                <SortableTableHead sortKey="action" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Action</SortableTableHead>
                <TableHead>Status</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Duration</TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {(sorted as AuditTrail[]).map((trail) => (
                <TableRow key={trail.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    <p className="font-mono text-xs text-gray-900">{formatAuditDate(trail.created_at)}</p>
                    <p className="font-sans text-xs text-gray-400 mt-0.5">{getRelativeAuditTime(trail.created_at)}</p>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="font-mono text-xs text-gray-800" title={trail.action}>
                      {trail.action.length > 38 ? trail.action.slice(0, 38) + '…' : trail.action}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-semibold ${statusClass(trail.status)}`}>
                      {trail.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4 max-w-[160px]">
                    <span className="font-mono text-xs text-gray-600 truncate block" title={trail.session_id}>
                      {trail.session_id || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <p className="font-sans text-xs text-gray-700">{trail.actor_email || trail.actor_id || '—'}</p>
                    <p className="font-sans text-xs text-gray-400 capitalize">{trail.actor_type}</p>
                  </TableCell>
                  <TableCell className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {trail.ip || '—'}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {trail.time_elapsed > 0 ? `${(trail.time_elapsed * 1000).toFixed(0)}ms` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
};
