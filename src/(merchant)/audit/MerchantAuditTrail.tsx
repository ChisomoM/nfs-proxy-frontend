import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  Search,
  Server,
  Timer,
  XCircle,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderRow,
  SortableTableHead,
} from '@/components/ui/table';
import { useTableSort } from '@/hooks/useTableSort';
import { AuditService } from '@/lib/api/services';
import { cn } from '@/lib/utils';
import type { AuditTrail, AuditTrailsResponse } from '@/types/audit';
import type { StatusType } from '@/components/shared/StatusBadge';

type ActionFilter = 'All' | string;

const actionFilterGroups: { label: string; options: string[] }[] = [
  {
    label: 'Auth',
    options: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'OTP_VERIFIED'],
  },
  {
    label: 'API Keys',
    options: ['API_KEY_CREATED', 'API_KEY_REVOKED', 'API_KEY_TOGGLED', 'API_KEY_VIEWED'],
  },
  {
    label: 'Merchant Keys',
    options: ['MERCHANT_KEY_CREATED', 'MERCHANT_KEY_REVOKED', 'MERCHANT_KEY_TOGGLED', 'MERCHANT_KEY_VIEWED'],
  },
  {
    label: 'Transactions',
    options: ['FUND_TRANSFER', 'BULK_FUND_TRANSFER', 'CASH_IN', 'CASH_OUT', 'REVERSAL', 'NAME_LOOKUP'],
  },
  {
    label: 'Apps & Profile',
    options: ['APP_CREATED', 'APP_UPDATED', 'APP_DELETED', 'PROFILE_UPDATED'],
  },
  {
    label: 'Users',
    options: ['MERCHANT_USER_INVITED', 'MERCHANT_USER_UPDATED', 'MERCHANT_USER_DELETED'],
  },
  {
    label: 'HTTP (unlabelled)',
    options: ['POST', 'DELETE', 'PATCH'],
  },
];

// ─── Action badge helpers ────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; cls: string }> = {
  ADMIN_LOGIN_SUCCESS:            { label: 'Admin Login',          cls: 'bg-success-light text-success-fg' },
  ADMIN_LOGIN_FAILED:             { label: 'Admin Login Failed',   cls: 'bg-danger-light text-danger-fg' },
  LOGIN_SUCCESS:                  { label: 'Login',                cls: 'bg-success-light text-success-fg' },
  LOGIN_FAILED:                   { label: 'Login Failed',         cls: 'bg-danger-light text-danger-fg' },
  REGISTER:                       { label: 'Register',             cls: 'bg-gp-sky-100 text-gp-sky-700' },
  OTP_VERIFIED:                   { label: 'OTP Verified',         cls: 'bg-gp-sky-100 text-gp-sky-700' },
  MERCHANT_INVITE_ACCEPTED:       { label: 'Invite Accepted',      cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  API_KEY_CREATED:                { label: 'Key Created',          cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  API_KEY_REVOKED:                { label: 'Key Revoked',          cls: 'bg-danger-light text-danger-fg' },
  API_KEY_TOGGLED:                { label: 'Key Toggled',          cls: 'bg-warning-light text-warning-fg' },
  API_KEY_VIEWED:                 { label: 'Key Viewed',           cls: 'bg-gp-sky-100 text-gp-sky-700' },
  MERCHANT_KEY_CREATED:           { label: 'Merchant Key Created', cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  MERCHANT_KEY_REVOKED:           { label: 'Merchant Key Revoked', cls: 'bg-danger-light text-danger-fg' },
  MERCHANT_KEY_TOGGLED:           { label: 'Merchant Key Toggled', cls: 'bg-warning-light text-warning-fg' },
  MERCHANT_KEY_VIEWED:            { label: 'Merchant Key Viewed',  cls: 'bg-gp-sky-100 text-gp-sky-700' },
  MERCHANT_CREATED:               { label: 'Merchant Created',     cls: 'bg-success-light text-success-fg' },
  MERCHANT_UPDATED:               { label: 'Merchant Updated',     cls: 'bg-warning-light text-warning-fg' },
  MERCHANT_DELETED:               { label: 'Merchant Deleted',     cls: 'bg-danger-light text-danger-fg' },
  APP_CREATED:                    { label: 'App Created',          cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  APP_UPDATED:                    { label: 'App Updated',          cls: 'bg-warning-light text-warning-fg' },
  APP_DELETED:                    { label: 'App Deleted',          cls: 'bg-danger-light text-danger-fg' },
  PROFILE_UPDATED:                { label: 'Profile Updated',      cls: 'bg-warning-light text-warning-fg' },
  USER_INVITED:                   { label: 'User Invited',         cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  USER_UPDATED:                   { label: 'User Updated',         cls: 'bg-warning-light text-warning-fg' },
  USER_DELETED:                   { label: 'User Deleted',         cls: 'bg-danger-light text-danger-fg' },
  MERCHANT_USER_INVITED:          { label: 'User Invited',         cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  MERCHANT_USER_UPDATED:          { label: 'User Updated',         cls: 'bg-warning-light text-warning-fg' },
  MERCHANT_USER_DELETED:          { label: 'User Deleted',         cls: 'bg-danger-light text-danger-fg' },
  FUND_TRANSFER:                  { label: 'Fund Transfer',        cls: 'bg-gp-sky-100 text-gp-sky-700' },
  BULK_FUND_TRANSFER:             { label: 'Bulk Transfer',        cls: 'bg-gp-sky-100 text-gp-sky-700' },
  CASH_IN:                        { label: 'Cash In',              cls: 'bg-success-light text-success-fg' },
  CASH_OUT:                       { label: 'Cash Out',             cls: 'bg-warning-light text-warning-fg' },
  REVERSAL:                       { label: 'Reversal',             cls: 'bg-orange-100 text-orange-700' },
  NAME_LOOKUP:                    { label: 'Name Lookup',          cls: 'bg-gray-100 text-gray-600' },
  BULK_NAME_LOOKUP:               { label: 'Bulk Lookup',          cls: 'bg-gray-100 text-gray-600' },
  WEBHOOK_CREATED:                { label: 'Webhook Created',      cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  WEBHOOK_UPDATED:                { label: 'Webhook Updated',      cls: 'bg-warning-light text-warning-fg' },
  WEBHOOK_DELETED:                { label: 'Webhook Deleted',      cls: 'bg-danger-light text-danger-fg' },
  DISBURSEMENT_TEMPLATE_CREATED:  { label: 'Template Created',     cls: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
};

const VERB_COLORS: Record<string, string> = {
  POST:   'bg-gp-cobalt-100 text-gp-cobalt-700',
  DELETE: 'bg-danger-light text-danger-fg',
  PATCH:  'bg-warning-light text-warning-fg',
  PUT:    'bg-warning-light text-warning-fg',
  GET:    'bg-gray-100 text-gray-600',
};

const getActionBadge = (action: string) => {
  const meta = ACTION_META[action];
  if (meta) return meta;
  const verb = action.split(' ')[0];
  return {
    label: action.length > 28 ? action.substring(0, 28) + '…' : action,
    cls: VERB_COLORS[verb] ?? 'bg-gray-100 text-gray-600',
  };
};

// ─── Actor avatar helpers ─────────────────────────────────────────────────────

const getInitials = (email: string) => {
  if (!email) return '??';
  const local = email.split('@')[0];
  const parts = local.split(/[._-]/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : local.substring(0, 2).toUpperCase();
};

// ─── Status + duration helpers ───────────────────────────────────────────────

const getStatusType = (s: number): StatusType =>
  s < 300 ? 'completed' : s < 500 ? 'pending' : 'failed';

const durationCls = (s: number) =>
  s < 0.2 ? 'text-success-fg' : s < 1 ? 'text-warning-fg' : 'text-danger-fg';

// ─── Formatting ─────────────────────────────────────────────────────────────

const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return timestamp;
  }
};

// ─── Export ──────────────────────────────────────────────────────────────────

const exportToCSV = (data: AuditTrail[]) => {
  const headers = [
    'ID',
    'Timestamp',
    'Action',
    'Actor Email',
    'Actor Type',
    'Status',
    'IP Address',
    'Duration (ms)',
    'Request ID',
    'Session ID',
  ];

  const rows = data.map((item) => [
    item.id,
    item.created_at,
    item.action,
    item.actor_email,
    item.actor_type,
    item.status.toString(),
    item.ip,
    Math.round(item.time_elapsed * 1000).toString(),
    item.request_id,
    item.session_id || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `audit-trail-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <tr className="border-b border-gray-50">
    <td className="py-3 pl-6 pr-3"><div className="h-4 w-32 skeleton" /></td>
    <td className="py-3 px-3"><div className="h-5 w-24 rounded-full skeleton" /></td>
    <td className="py-3 px-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full skeleton flex-shrink-0" />
        <div className="h-4 w-36 skeleton" />
      </div>
    </td>
    <td className="py-3 px-3"><div className="h-4 w-20 skeleton" /></td>
    <td className="py-3 px-3"><div className="h-5 w-16 rounded-full skeleton" /></td>
    <td className="py-3 px-3"><div className="h-4 w-24 skeleton" /></td>
    <td className="py-3 px-3 pr-6"><div className="h-4 w-12 skeleton" /></td>
    <td className="py-3 pr-6"><div className="h-4 w-8 skeleton" /></td>
  </tr>
);

// ─── Component ───────────────────────────────────────────────────────────────

export const MerchantAuditTrail: React.FC = () => {
  const [auditData, setAuditData] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    const loadAuditTrail = async () => {
      try {
        setLoading(true);
        setError(null);
        const query: Record<string, string> = {
          limit: String(pageSize),
          offset: String((page - 1) * pageSize),
        };
        if (searchTerm.trim()) query.q = searchTerm.trim();
        if (actionFilter !== 'All') query.action = actionFilter;
        if (dateFrom) query.date_from = dateFrom;
        if (dateTo) query.date_to = dateTo;

        const response: AuditTrailsResponse = await AuditService.listMerchantTrails(query);
        const trails = Array.isArray(response.data) ? response.data : [];
        setAuditData(trails);
        setTotalPages(response.meta?.total_pages || 1);
        setTotalCount(response.meta?.count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit trail');
      } finally {
        setLoading(false);
      }
    };

    loadAuditTrail();
  }, [searchTerm, actionFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, actionFilter, dateFrom, dateTo]);

  const { sorted, sortColumn, sortDirection, handleSort } = useTableSort(auditData);

  const handleExport = () => {
    if (sorted.length > 0) {
      exportToCSV(sorted);
    }
  };

  const errorCount = auditData.filter((x) => x.status >= 400).length;
  const avgResponseMs =
    auditData.length > 0
      ? Math.round(auditData.reduce((s, x) => s + x.time_elapsed, 0) / auditData.length * 1000)
      : null;

  const startRecord = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalCount);

  return (
    <PageTransition className="space-y-8">
      {/* ── Header ── */}
      <PageHeader
        title="Audit Trail"
        subtitle="Complete log of API calls, logins, and operations performed under your account."
        action={
          <motion.button
            onClick={handleExport}
            disabled={sorted.length === 0}
            className={cn(
              'btn-gradient shimmer-surface h-10 px-5 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient transition-opacity',
              sorted.length === 0 && 'opacity-50 cursor-not-allowed'
            )}
            whileHover={sorted.length > 0 ? { scale: 1.02 } : {}}
            whileTap={sorted.length > 0 ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Download size={15} />
            Export CSV
          </motion.button>
        }
      />

      {/* ── Stats row ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<Activity />}
            label="Total Events"
            value={totalCount.toLocaleString()}
            iconVariant="cobalt"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<XCircle />}
            label="Errors (this page)"
            value={errorCount.toString()}
            iconVariant="danger"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<Timer />}
            label="Avg Response"
            value={avgResponseMs !== null ? `${avgResponseMs}ms` : '—'}
            iconVariant="sky"
          />
        </motion.div>
      </motion.div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          <span className="font-sans text-text-xs font-semibold text-gray-400 uppercase tracking-wide">Filters</span>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by action, email, request ID, or session"
                className="h-10 w-full rounded-xl bg-gray-50 pl-9 pr-3 font-sans text-text-sm text-gray-900 outline-none ring-1 ring-transparent transition-all placeholder:text-gray-400 focus:bg-white focus:ring-gp-cobalt/30"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative inline-flex">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-3 font-sans text-text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-50 focus:border-gp-cobalt/30 focus:ring-2 focus:ring-gp-cobalt/20"
                />
              </div>
              <span className="text-gray-400 font-sans text-text-sm">to</span>
              <div className="relative inline-flex">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-3 font-sans text-text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-50 focus:border-gp-cobalt/30 focus:ring-2 focus:ring-gp-cobalt/20"
                />
              </div>
              <div className="relative inline-flex">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
                  className="h-10 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-10 font-sans text-text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-50 focus:border-gp-cobalt/30 focus:ring-2 focus:ring-gp-cobalt/20 cursor-pointer"
                >
                  <option value="All">All actions</option>
                  {actionFilterGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border-gradient shadow-sm overflow-hidden">
        {error ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-light">
              <AlertCircle className="h-6 w-6 text-danger-fg" />
            </div>
            <p className="font-display text-text-lg font-semibold text-gray-900">Failed to load audit trail</p>
            <p className="mt-1 font-sans text-text-sm text-gray-500">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <SortableTableHead sortKey="created_at" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="pl-6 min-w-[160px]">
                    Timestamp
                  </SortableTableHead>
                  <SortableTableHead sortKey="action" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="min-w-[160px]">
                    Action
                  </SortableTableHead>
                  <SortableTableHead sortKey="actor_email" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="min-w-[200px]">
                    Actor
                  </SortableTableHead>
                  <SortableTableHead sortKey="ip" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="min-w-[130px]">
                    IP
                  </SortableTableHead>
                  <SortableTableHead sortKey="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="min-w-[110px]">
                    Status
                  </SortableTableHead>
                  <SortableTableHead sortKey="session_id" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="min-w-[130px]">
                    Session
                  </SortableTableHead>
                  <SortableTableHead sortKey="time_elapsed" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort} className="min-w-[100px]">
                    Duration
                  </SortableTableHead>
                  <TableHead className="pr-6 min-w-[70px]" />
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Server className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="font-display text-text-lg font-semibold text-gray-900">No audit records found</p>
                      <p className="mt-1 font-sans text-text-sm text-gray-500">
                        {auditData.length === 0
                          ? 'Activity will appear here as you use the platform.'
                          : 'Try adjusting your search or filter criteria.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sorted.map((trail, idx) => {
                    const actionBadge = getActionBadge(trail.action);
                    const initials = getInitials(trail.actor_email);
                    return (
                      <motion.tr
                        key={trail.id}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3 }}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors group"
                      >
                        {/* Timestamp */}
                        <TableCell className="pl-6">
                          <time className="font-mono text-text-xs text-gray-500 whitespace-nowrap">
                            {formatTimestamp(trail.created_at)}
                          </time>
                        </TableCell>

                        {/* Action badge */}
                        <TableCell>
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-text-xs font-medium whitespace-nowrap', actionBadge.cls)}>
                            {actionBadge.label}
                          </span>
                        </TableCell>

                        {/* Actor — avatar + email */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gp-cobalt-100 text-gp-cobalt-700 flex items-center justify-center flex-shrink-0">
                              <span className="font-sans text-text-xs font-bold leading-none">{initials}</span>
                            </div>
                            <span className="font-sans text-text-sm text-gray-700 truncate max-w-[160px] group-hover:text-gp-cobalt transition-colors">
                              {trail.actor_email || '—'}
                            </span>
                          </div>
                        </TableCell>

                        {/* IP */}
                        <TableCell>
                          <span className="font-mono text-text-xs text-gray-500">{trail.ip || '—'}</span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={getStatusType(trail.status)} />
                            <span className="font-mono text-text-xs text-gray-400 tabular-nums">{trail.status}</span>
                          </div>
                        </TableCell>

                        {/* Session */}
                        <TableCell>
                          <span
                            className="font-mono text-text-xs text-gray-400 truncate max-w-[110px] inline-block"
                            title={trail.session_id}
                          >
                            {trail.session_id ? trail.session_id.substring(0, 12) + '…' : '—'}
                          </span>
                        </TableCell>

                        {/* Duration */}
                        <TableCell>
                          <span className={cn('font-mono text-text-xs tabular-nums font-medium', durationCls(trail.time_elapsed))}>
                            {Math.round(trail.time_elapsed * 1000)}ms
                          </span>
                        </TableCell>

                        {/* View link */}
                        <TableCell className="pr-6">
                          <Link
                            className="font-sans text-text-sm font-semibold text-gp-cobalt hover:text-gp-sky transition-colors"
                            to={`/merchant/audit/${trail.id}`}
                          >
                            View
                          </Link>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-sans text-text-sm text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-700">{startRecord.toLocaleString()}–{endRecord.toLocaleString()}</span>
            {' '}of{' '}
            <span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span>
            {' '}records
          </span>
          <div className="flex items-center gap-2">
            <button
              className="h-9 rounded-xl border border-gray-200 bg-white px-4 font-sans text-text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              disabled={page <= 1}
              onClick={() => setPage((v) => Math.max(1, v - 1))}
            >
              Previous
            </button>
            <span className="font-mono text-text-xs text-gray-400 px-1 tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              className="h-9 rounded-xl border border-gray-200 bg-white px-4 font-sans text-text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              disabled={page >= totalPages}
              onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
