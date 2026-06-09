import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Loader,
  Search,
} from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SectionCard } from '@/components/shared/SectionCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MerchantToolbar } from '@/components/shared/MerchantToolbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderRow,
  TableHead,
  TableRow,
  SortableTableHead,
} from '@/components/ui/table';
import { useTableSort } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';
import { fetchData } from '@/lib/api/crud';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as any } },
};

type TransactionStatus = 'completed' | 'pending' | 'failed';
type TransactionFilter = 'all' | TransactionStatus;

interface AdminTransaction {
  id: string;
  merchant: string;
  account: string;
  reference: string;
  amount: string;
  type: 'credit' | 'debit';
  status: TransactionStatus;
  timestamp: string;
}

const statusFilters: Array<{ label: string; value: TransactionFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

function transformTransaction(txn: any): AdminTransaction {
  const amount = parseFloat(txn.amount?.toString() ?? '0');
  const isCredit = txn.direction?.toLowerCase() === 'in';
  const rawStatus: string = txn.status ?? 'pending';

  return {
    id: txn.ext_id,
    merchant: txn.merchant_name || txn.app_id || 'Unknown',
    account: txn.source_account || txn.destination_account || 'N/A',
    reference: txn.external_reference || txn.type || 'Transaction',
    amount: `ZMW ${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    type: isCredit ? 'credit' : 'debit',
    status: (rawStatus === 'success' ? 'completed' : rawStatus) as TransactionStatus,
    timestamp: new Date(txn.created_at).toLocaleString(),
  };
}

export const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalVolume: '0.00',
    successCount: 0,
    totalCount: 0,
    merchantCount: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchData('ADMIN_TRANSACTIONS', 'GET');
        const payload = Array.isArray(response) ? response : [];

        const transformed = payload.map(transformTransaction);
        setTransactions(transformed);

        const volume = transformed.reduce((sum, t) => {
          const n = parseFloat(t.amount.replace(/[^0-9.-]/g, ''));
          return sum + n;
        }, 0);
        const successCount = transformed.filter(t => t.status === 'completed').length;
        const merchantCount = new Set(payload.map((t: any) => t.merchant_name || t.app_id)).size;

        setStats({
          totalVolume: volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          successCount,
          totalCount: transformed.length,
          merchantCount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return transactions.filter(txn => {
      const matchesStatus = activeFilter === 'all' || txn.status === activeFilter;
      const matchesSearch =
        !q ||
        txn.id.toLowerCase().includes(q) ||
        txn.merchant.toLowerCase().includes(q) ||
        txn.account.toLowerCase().includes(q) ||
        txn.reference.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, searchTerm, transactions]);

  const { sorted, sortColumn, sortDirection, handleSort } = useTableSort(filtered);

  const successRate = stats.totalCount > 0
    ? `${((stats.successCount / stats.totalCount) * 100).toFixed(1)}%`
    : '—';

  if (error) {
    return (
      <PageTransition className="space-y-8">
        <PageHeader title="Transactions" subtitle="Monitor all payment transactions across the platform." />
        <div className="border-2 border-dashed border-red-100 rounded-2xl flex flex-col items-center justify-center py-16 text-center">
          <div className="h-14 w-14 rounded-xl bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle size={26} className="text-red-600" />
          </div>
          <h3 className="font-display font-semibold text-text-xl text-gray-900 mb-2">Failed to load transactions</h3>
          <p className="font-sans text-text-sm text-gray-500 mb-6 max-w-xs px-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-gradient shimmer-surface h-10 px-5 rounded-xl text-white font-sans text-text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Transactions"
        subtitle="Monitor all payment transactions across the platform."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={<Activity />} label="Total Volume" value={`ZMW ${stats.totalVolume}`} iconVariant="cobalt" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<ArrowLeftRight />} label="Total Transactions" value={String(stats.totalCount)} iconVariant="sky" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<CheckCircle2 />} label="Success Rate" value={successRate} iconVariant="success" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Activity />} label="Active Merchants" value={String(stats.merchantCount)} iconVariant="warning" />
        </motion.div>
      </motion.div>

      <MerchantToolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search ID, merchant, account, or reference"
            className="h-10 w-full rounded-xl bg-gray-50 pl-9 pr-3 font-sans text-text-sm text-gray-900 outline-none ring-1 ring-transparent transition-all placeholder:text-gray-400 focus:bg-white focus:ring-gp-cobalt/30"
          />
        </div>
      </MerchantToolbar>

      <SectionCard
        title="All Transactions"
        onGrayBg
        contentClassName="p-0"
        action={
          <div className="flex rounded-xl bg-gray-50 p-1">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'h-8 rounded-lg px-3 font-sans text-text-xs font-semibold transition-all',
                  activeFilter === filter.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        }
      >
        {isLoading ? (
          <div className="px-6 py-12 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-xl bg-gp-cobalt-100 flex items-center justify-center mb-4 animate-pulse">
              <Loader size={24} className="text-gp-cobalt animate-spin" />
            </div>
            <p className="font-display text-text-lg font-semibold text-gray-900">Loading transactions</p>
            <p className="mt-1 font-sans text-text-sm text-gray-500">Fetching all platform transactions...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-display text-text-lg font-semibold text-gray-900">No transactions found</p>
            <p className="mt-1 font-sans text-text-sm text-gray-500">
              {transactions.length === 0
                ? 'No transactions have been processed yet.'
                : 'Try another search or status filter.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderRow>
                <TableHead className="pl-6">ID</TableHead>
                <SortableTableHead sortKey="merchant" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Merchant</SortableTableHead>
                <SortableTableHead sortKey="account" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Account</SortableTableHead>
                <TableHead>Reference</TableHead>
                <SortableTableHead sortKey="amount" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Amount</SortableTableHead>
                <SortableTableHead sortKey="type" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Type</SortableTableHead>
                <SortableTableHead sortKey="status" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Status</SortableTableHead>
                <SortableTableHead sortKey="timestamp" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Timestamp</SortableTableHead>
              </TableHeaderRow>
            </TableHeader>
            <TableBody>
              {sorted.map((txn, idx) => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors cursor-pointer group"
                >
                  <TableCell className="pl-6">
                    <code className="font-mono text-text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                      {txn.id}
                    </code>
                  </TableCell>
                  <TableCell className="font-sans text-text-sm text-gray-700 font-medium group-hover:text-gp-cobalt transition-colors">
                    {txn.merchant}
                  </TableCell>
                  <TableCell className="font-sans text-text-sm text-gray-800 font-semibold">
                    {txn.account}
                  </TableCell>
                  <TableCell className="font-sans text-text-sm text-gray-500">
                    {txn.reference}
                  </TableCell>
                  <TableCell className="font-mono text-text-sm tabular-nums font-semibold">
                    <span className={txn.type === 'credit' ? 'text-success-fg' : 'text-danger-fg'}>
                      {txn.type === 'credit' ? '+' : '-'} {txn.amount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 font-sans text-text-xs font-semibold capitalize ${
                      txn.type === 'credit' ? 'text-success-fg' : 'text-danger-fg'
                    }`}>
                      {txn.type === 'credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {txn.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={txn.status} />
                  </TableCell>
                  <TableCell className="font-mono text-text-xs text-gray-400">
                    {txn.timestamp}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </PageTransition>
  );
};
