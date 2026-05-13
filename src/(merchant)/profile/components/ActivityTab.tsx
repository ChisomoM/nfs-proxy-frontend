import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeaderRow,
  TableRow,
  SortableTableHead,
} from '@/components/ui/table';
import { useTableSort } from '@/hooks/useTableSort';
import { Badge } from '@/components/ui/badge';
import { LogIn, Activity, Clock, Search } from 'lucide-react';
import { fetchData } from '@/lib/api/crud';
import type { AuditTrail } from '@/types/audit';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

const ActivityTab: React.FC = () => {
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loginEvents = auditTrails.filter((trail) =>
    trail.action.toLowerCase().includes('login')
  );
  const recentLogins = [...loginEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const {
    sorted: sortedLogins,
    sortColumn: loginSortColumn,
    sortDirection: loginSortDirection,
    handleSort: requestLoginSort,
  } = useTableSort<AuditTrail>(recentLogins);

  const filteredAuditTrails = auditTrails.filter(
    (trail) =>
      trail.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trail.session_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      trail.actor_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const {
    sorted: sortedAuditTrails,
    sortColumn: auditSortColumn,
    sortDirection: auditSortDirection,
    handleSort: requestAuditSort,
  } = useTableSort<AuditTrail>(filteredAuditTrails);

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchData('MERCHANT_AUDIT_TRAILS', 'GET');
      setAuditTrails(response || []);
    } catch (err) {
      setError('Failed to load activity data. Please try again.');
      console.error('Error fetching audit trails:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'Action',
      'Status',
      'IP Address',
      'Duration (ms)',
      'Actor Email',
      'Request ID',
      'Session ID',
    ];
    const rows = auditTrails.map((trail) => [
      trail.created_at,
      trail.action,
      trail.status.toString(),
      trail.ip,
      (trail.time_elapsed * 1000).toFixed(0),
      trail.actor_email,
      trail.request_id,
      trail.session_id || '',
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-report-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: string) => {
    if (action === 'LOGIN_SUCCESS') return <Badge variant="success">{action}</Badge>;
    if (action === 'LOGIN_FAILED') return <Badge variant="destructive">{action}</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return (
        <span className="text-success-fg bg-success-light px-2 py-1 rounded-md text-xs font-medium">
          {status}
        </span>
      );
    }
    if (status >= 400) {
      return (
        <span className="text-danger-fg bg-danger-light px-2 py-1 rounded-md text-xs font-medium">
          {status}
        </span>
      );
    }
    return (
      <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
        {status}
      </span>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '—';
    return `${(seconds * 1000).toFixed(0)}ms`;
  };

  const loginEventCount = loginEvents.length;
  const totalEvents = auditTrails.length;
  const lastActive = auditTrails.length > 0
    ? [...auditTrails].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-40 w-full rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-gradient">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAuditData}
              className="px-4 py-2 bg-gp-cobalt text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="border-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Login Events</p>
                <p className="text-3xl font-display font-bold text-gray-900">
                  {loginEventCount}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <LogIn className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Events</p>
                <p className="text-3xl font-display font-bold text-gray-900">
                  {totalEvents}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Active</p>
                <p className="text-3xl font-display font-bold text-gray-900">
                  {lastActive ? getRelativeTime(lastActive) : '—'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Sign-Ins */}
      <motion.div variants={itemVariants}>
        <Card className="border-gradient">
          <CardHeader>
            <CardTitle>Recent Sign-Ins</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedLogins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No login events recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableHeaderRow>
                      <SortableTableHead
                        sortKey="created_at"
                        sortColumn={loginSortColumn}
                        sortDirection={loginSortDirection}
                        onSort={requestLoginSort}
                        className="min-w-[200px]"
                      >
                        Date & Time
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="action"
                        sortColumn={loginSortColumn}
                        sortDirection={loginSortDirection}
                        onSort={requestLoginSort}
                        className="min-w-[150px]"
                      >
                        Action
                      </SortableTableHead>
                      <TableHead className="min-w-[140px]">IP Address</TableHead>
                      <TableHead className="min-w-[100px]">Duration</TableHead>
                    </TableHeaderRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLogins.map((trail) => (
                      <TableRow key={trail.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatDate(trail.created_at)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getRelativeTime(trail.created_at)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(trail.action)}</TableCell>
                        <TableCell className="font-mono text-xs">{trail.ip}</TableCell>
                        <TableCell className="tabular-nums">
                          {formatDuration(trail.time_elapsed)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Audit Log */}
      <motion.div variants={itemVariants}>
        <Card className="border-gradient">
          <CardHeader>
            <CardTitle>Full Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by action, email, or session..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gp-sky focus:border-transparent"
                />
              </div>
            </div>

            {sortedAuditTrails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery
                  ? 'No matching audit events found.'
                  : 'No audit events recorded yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableHeaderRow>
                      <SortableTableHead
                        sortKey="created_at"
                        sortColumn={auditSortColumn}
                        sortDirection={auditSortDirection}
                        onSort={requestAuditSort}
                        className="min-w-[180px]"
                      >
                        Timestamp
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="action"
                        sortColumn={auditSortColumn}
                        sortDirection={auditSortDirection}
                        onSort={requestAuditSort}
                        className="min-w-[200px]"
                      >
                        Action
                      </SortableTableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[140px]">Session</TableHead>
                      <TableHead className="min-w-[100px]">Duration</TableHead>
                    </TableHeaderRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAuditTrails.map((trail) => (
                      <TableRow key={trail.id}>
                        <TableCell className="text-sm">
                          {formatDate(trail.created_at)}
                        </TableCell>
                        <TableCell
                          className="text-sm truncate max-w-[200px]"
                          title={trail.action.length > 40 ? trail.action : undefined}
                        >
                          {trail.action.length > 40
                            ? `${trail.action.slice(0, 40)}...`
                            : trail.action}
                        </TableCell>
                        <TableCell>{getStatusBadge(trail.status)}</TableCell>
                        <TableCell className="truncate max-w-[140px] font-mono text-xs" title={trail.session_id}>
                          {trail.session_id || '—'}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {formatDuration(trail.time_elapsed)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CSV Export */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <button
          onClick={exportToCSV}
          disabled={auditTrails.length === 0}
          className="text-gp-sky font-medium hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Audit Report →
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ActivityTab;
