import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  Download,
  Filter,
  Globe,
  Search,
  Server,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MerchantToolbar } from '@/components/shared/MerchantToolbar';
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
import { fetchEnvelope } from '@/lib/api/crud';
import { cn } from '@/lib/utils';
import type { AuditTrail, AuditTrailsResponse } from '@/types/audit';
import type { StatusType } from '@/components/shared/StatusBadge';

type ActionFilter = 'All' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'POST' | 'GET' | 'DELETE';

const actionFilters: ActionFilter[] = ['All', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'POST', 'GET', 'DELETE'];

const getStatusBadgeType = (status: number): StatusType => {
  if (status >= 200 && status < 300) return 'completed';
  if (status >= 300 && status < 500) return 'pending';
  return 'failed';
};

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

        const response: AuditTrailsResponse = await fetchEnvelope('MERCHANT_AUDIT_TRAILS', 'GET', {}, null, query);
        const trails = Array.isArray(response.data) ? response.data : [];
        setAuditData(trails);
        setTotalPages(response.meta?.total_pages || 1);
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

  return (
    <PageTransition className="space-y-8">
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

      <MerchantToolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              {actionFilters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>
        </div>
      </MerchantToolbar>

      <SectionCard title="Activity Log" onGrayBg contentClassName="p-0">
        {loading ? (
          <div className="px-6 py-16 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-gp-cobalt"
            />
            <p className="mt-4 font-sans text-text-sm text-gray-500">Loading audit trail...</p>
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-light">
              <AlertCircle className="h-6 w-6 text-danger-fg" />
            </div>
            <p className="font-display text-text-lg font-semibold text-gray-900">Failed to load audit trail</p>
            <p className="mt-1 font-sans text-text-sm text-gray-500">{error}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Server className="h-6 w-6 text-gray-400" />
            </div>
            <p className="font-display text-text-lg font-semibold text-gray-900">No audit records found</p>
            <p className="mt-1 font-sans text-text-sm text-gray-500">
              {auditData.length === 0
                ? 'Activity will appear here as you use the platform.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <SortableTableHead
                  sortKey="created_at"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="pl-6"
                >
                  Timestamp
                </SortableTableHead>
                <SortableTableHead
                  sortKey="action"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Action
                </SortableTableHead>
                <SortableTableHead
                  sortKey="actor_email"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Actor Email
                </SortableTableHead>
                <SortableTableHead
                  sortKey="ip"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  IP Address
                </SortableTableHead>
                <SortableTableHead
                  sortKey="status"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Status
                </SortableTableHead>
                <SortableTableHead
                  sortKey="session_id"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Session
                </SortableTableHead>
                <SortableTableHead
                  sortKey="time_elapsed"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="pr-6"
                >
                  Duration
                </SortableTableHead>
                <TableHead className="pr-6">Details</TableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {sorted.map((trail, idx) => (
                <motion.tr
                  key={trail.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors"
                >
                  <TableCell className="pl-6">
                    <time className="font-mono text-text-xs text-gray-600 block">
                      {formatTimestamp(trail.created_at)}
                    </time>
                  </TableCell>
                  <TableCell>
                    <span className="font-sans text-text-sm font-semibold text-gray-800">
                      {trail.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-sans text-text-sm text-gray-600">
                      {trail.actor_email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Globe size={12} className="text-gray-400 flex-shrink-0" />
                      <code className="font-mono text-text-xs text-gray-500">
                        {trail.ip}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={getStatusBadgeType(trail.status)} />
                    <span className="ml-2 font-mono text-text-xs text-gray-400">
                      {trail.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-text-xs text-gray-500 block max-w-[120px] truncate" title={trail.session_id}>
                      {trail.session_id || '—'}
                    </code>
                  </TableCell>
                  <TableCell className="pr-6">
                    <span
                      className={cn(
                        'font-mono text-text-xs tabular-nums font-medium',
                        trail.time_elapsed < 0.2
                          ? 'text-success-fg'
                          : trail.time_elapsed < 1
                          ? 'text-warning-fg'
                          : 'text-danger-fg'
                      )}
                    >
                      {Math.round(trail.time_elapsed * 1000)}ms
                    </span>
                  </TableCell>
                  <TableCell className="pr-6">
                    <Link className="font-sans text-text-sm font-semibold text-gp-cobalt hover:text-gp-sky" to={`/merchant/audit/${trail.id}`}>
                      View
                    </Link>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <button
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 font-sans text-text-sm text-gray-700 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <span className="font-mono text-text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 font-sans text-text-sm text-gray-700 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </button>
        </div>
      )}
    </PageTransition>
  );
};
