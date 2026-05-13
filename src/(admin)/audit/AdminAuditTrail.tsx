import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Search,
  Server,
  User,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
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
import { fetchEnvelope } from '@/lib/api/crud';
import { cn } from '@/lib/utils';
import type { AuditTrail, AuditTrailsResponse } from '@/types/audit';
import type { StatusType } from '@/components/shared/StatusBadge';

type ActionFilter =
  | 'All'
  | 'ADMIN_LOGIN_SUCCESS'
  | 'ADMIN_LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'POST'
  | 'GET'
  | 'DELETE'
  | 'PATCH';

const actionFilters: ActionFilter[] = [
  'All',
  'ADMIN_LOGIN_SUCCESS',
  'ADMIN_LOGIN_FAILED',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'API_KEY_CREATED',
  'API_KEY_REVOKED',
  'POST',
  'GET',
  'DELETE',
  'PATCH',
];

const getStatusBadgeType = (status: number): StatusType => {
  if (status >= 200 && status < 300) return 'completed';
  if (status >= 300 && status < 500) return 'pending';
  return 'failed';
};

const getActorTypeBadge = (actorType: string): { label: string; className: string } => {
  const type = actorType.toLowerCase();
  if (type.includes('admin')) {
    return {
      label: 'Admin',
      className: 'bg-purple-100 text-purple-700',
    };
  }
  if (type.includes('merchant')) {
    return {
      label: 'Merchant',
      className: 'bg-gp-cobalt-100 text-gp-cobalt-700',
    };
  }
  if (type.includes('api') || type.includes('key')) {
    return {
      label: 'API Key',
      className: 'bg-gp-sky-100 text-gp-sky-700',
    };
  }
  return {
    label: actorType,
    className: 'bg-gray-100 text-gray-600',
  };
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
    'Merchant ID',
    'Actor Email',
    'Actor Type',
    'Action',
    'Status',
    'IP Address',
    'Duration (ms)',
    'Request ID',
    'Session ID',
  ];

  const rows = data.map((item) => [
    item.id,
    item.created_at,
    item.merchant_id,
    item.actor_email,
    item.actor_type,
    item.action,
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
  link.setAttribute('download', `admin-audit-trail-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const AdminAuditTrail: React.FC = () => {
  const [auditData, setAuditData] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [merchantIdFilter, setMerchantIdFilter] = useState('');
  const [actorIdFilter, setActorIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 25;

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams: Record<string, string> = {
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      };
      if (merchantIdFilter.trim()) {
        queryParams.merchant_id = merchantIdFilter.trim();
      }
      if (actorIdFilter.trim()) {
        queryParams.actor_id = actorIdFilter.trim();
      }
      if (searchTerm.trim()) queryParams.q = searchTerm.trim();
      if (actionFilter !== 'All') queryParams.action = actionFilter;
      if (dateFrom) queryParams.date_from = dateFrom;
      if (dateTo) queryParams.date_to = dateTo;

      const response: AuditTrailsResponse = await fetchEnvelope('ADMIN_AUDIT_TRAILS', 'GET', {}, null, queryParams);
      const trails = Array.isArray(response.data) ? response.data : [];
      setAuditData(trails);
      setTotalPages(response.meta?.total_pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditTrail();
  }, [merchantIdFilter, actorIdFilter, searchTerm, actionFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    setPage(1);
  }, [merchantIdFilter, actorIdFilter, searchTerm, actionFilter, dateFrom, dateTo]);

  const { sorted, sortColumn, sortDirection, handleSort } = useTableSort(auditData);

  const handleExport = () => {
    if (sorted.length > 0) {
      exportToCSV(sorted);
    }
  };

  const handleRefresh = () => {
    loadAuditTrail();
  };

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Admin Audit Trail"
        subtitle="Cross-tenant audit trail monitoring all merchant activity, admin operations, and API events."
        action={
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleRefresh}
              disabled={loading}
              className={cn(
                'h-10 px-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-colors hover:bg-gray-50',
                loading && 'opacity-50 cursor-not-allowed'
              )}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <RefreshCw size={15} className={cn(loading && 'animate-spin')} />
              Refresh
            </motion.button>
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
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={merchantIdFilter}
              onChange={(e) => setMerchantIdFilter(e.target.value)}
              placeholder="Filter by Merchant ID (server-side)"
              className="h-10 w-full rounded-xl bg-gray-50 pl-9 pr-3 font-sans text-text-sm text-gray-900 outline-none ring-1 ring-transparent transition-all placeholder:text-gray-400 focus:bg-white focus:ring-gp-cobalt/30"
            />
          </div>
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={actorIdFilter}
              onChange={(e) => setActorIdFilter(e.target.value)}
              placeholder="Filter by Actor ID (server-side)"
              className="h-10 w-full rounded-xl bg-gray-50 pl-9 pr-3 font-sans text-text-sm text-gray-900 outline-none ring-1 ring-transparent transition-all placeholder:text-gray-400 focus:bg-white focus:ring-gp-cobalt/30"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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
        </div>
      </div>

      <SectionCard title="Cross-Tenant Activity Log" onGrayBg contentClassName="p-0">
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
                ? 'Activity will appear here as merchants and admins use the platform.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableHeaderRow>
                  <SortableTableHead
                    sortKey="created_at"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="pl-6 min-w-[160px]"
                  >
                    Timestamp
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="merchant_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[120px]"
                  >
                    Merchant ID
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="actor_email"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[200px]"
                  >
                    Actor
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="actor_type"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[120px]"
                  >
                    Actor Type
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="action"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[180px]"
                  >
                    Action
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="status"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[100px]"
                  >
                    Status
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="session_id"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[140px]"
                  >
                    Session
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="ip"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[140px]"
                  >
                    IP
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="time_elapsed"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="pr-6 min-w-[110px]"
                  >
                    Duration
                  </SortableTableHead>
                  <TableHead className="pr-6 min-w-[90px]">Details</TableHead>
                </TableHeaderRow>
              </TableHeader>
              <TableBody>
                {sorted.map((item, idx) => {
                  const actorBadge = getActorTypeBadge(item.actor_type);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group"
                    >
                      <TableCell className="pl-6">
                        <span className="font-mono text-text-xs text-gray-600 whitespace-nowrap">
                          {formatTimestamp(item.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code
                          className="font-mono text-text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md truncate max-w-[100px] inline-block"
                          title={item.merchant_id}
                        >
                          {item.merchant_id}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="font-sans text-text-sm text-gray-700 font-medium group-hover:text-gp-cobalt transition-colors">
                          {item.actor_email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-text-xs font-medium',
                            actorBadge.className
                          )}
                        >
                          {actorBadge.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-text-xs text-gray-800 font-medium">
                          {item.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={getStatusBadgeType(item.status)} />
                          <span className="font-mono text-text-xs text-gray-500">{item.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-mono text-text-xs text-gray-500 truncate max-w-[120px] inline-block"
                          title={item.session_id}
                        >
                          {item.session_id || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-text-xs text-gray-500">{item.ip}</span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <span className="font-mono text-text-xs text-gray-500 tabular-nums">
                          {Math.round(item.time_elapsed * 1000)}ms
                        </span>
                      </TableCell>
                      <TableCell className="pr-6">
                        <Link className="font-sans text-text-sm font-semibold text-gp-cobalt hover:text-gp-sky" to={`/admin/audit/${item.id}`}>
                          View
                        </Link>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
