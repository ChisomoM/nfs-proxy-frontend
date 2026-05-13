import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal,
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
  TableHead,
  TableHeader,
  TableHeaderRow,
  TableRow,
  SortableTableHead,
} from '@/components/ui/table';
import { useTableSort } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';

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

const mockTransactions = [
  { id: 'TXN-001', account: 'John Doe',    reference: 'Mobile money collection', amount: 'ZMW 12,450.75', type: 'credit' as const, status: 'completed' as TransactionStatus, timestamp: '2024-01-15 14:30' },
  { id: 'TXN-002', account: 'Jane Smith',  reference: 'Merchant payout',          amount: 'ZMW 890.00',    type: 'debit'  as const, status: 'pending'   as TransactionStatus, timestamp: '2024-01-15 13:15' },
  { id: 'TXN-003', account: 'Bob Johnson', reference: 'POS settlement',           amount: 'ZMW 2,500.50',  type: 'credit' as const, status: 'completed' as TransactionStatus, timestamp: '2024-01-15 12:00' },
  { id: 'TXN-004', account: 'Mary Banda',  reference: 'Wallet reversal',          amount: 'ZMW 420.00',    type: 'debit'  as const, status: 'failed'    as TransactionStatus, timestamp: '2024-01-15 11:42' },
];

const statusFilters: Array<{ label: string; value: TransactionFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

export const MerchantTransactions: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return mockTransactions.filter((txn) => {
      const matchesStatus = activeFilter === 'all' || txn.status === activeFilter;
      const matchesSearch =
        !q ||
        txn.id.toLowerCase().includes(q) ||
        txn.account.toLowerCase().includes(q) ||
        txn.reference.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const { sorted, sortColumn, sortDirection, handleSort } = useTableSort(filtered);

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Transactions"
        subtitle="Review payment movement, investigate transaction state, and prepare exports."
        action={
          <motion.button
            className="btn-gradient shimmer-surface h-10 px-5 rounded-xl text-white font-sans text-text-sm font-semibold inline-flex items-center gap-2 shadow-btn-gradient"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Download size={15} />
            Export
          </motion.button>
        }
      />

      {/* Summary Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={<ArrowDownLeft />} label="Total Received" value="ZMW 13,951.25" iconVariant="success" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<ArrowUpRight />} label="Total Sent" value="ZMW 890.00" iconVariant="danger" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<ArrowLeftRight />} label="Net Balance" value="ZMW 13,061.25" iconVariant="cobalt" />
        </motion.div>
      </motion.div>

      <MerchantToolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search ID, account, or reference"
            className="h-10 w-full rounded-xl bg-gray-50 pl-9 pr-3 font-sans text-text-sm text-gray-900 outline-none ring-1 ring-transparent transition-all placeholder:text-gray-400 focus:bg-white focus:ring-gp-cobalt/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 font-sans text-text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Calendar size={15} />
            Jan 15, 2024
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 font-sans text-text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </MerchantToolbar>

      {/* Transaction History */}
      <SectionCard
        title="Transaction History"
        onGrayBg
        contentClassName="p-0"
        action={
          <div className="flex rounded-xl bg-gray-50 p-1">
            {statusFilters.map((filter) => (
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
        <Table>
          <TableHeader>
            <TableHeaderRow>
              <TableHead className="pl-6">ID</TableHead>
              <SortableTableHead sortKey="account" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Account</SortableTableHead>
              <TableHead>Reference</TableHead>
              <SortableTableHead sortKey="amount" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Amount</SortableTableHead>
              <SortableTableHead sortKey="type" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Type</SortableTableHead>
              <SortableTableHead sortKey="status" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Status</SortableTableHead>
              <SortableTableHead sortKey="timestamp" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Timestamp</SortableTableHead>
              <TableHead className="w-10 pr-5" />
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
                <TableCell>
                  <span className="font-sans text-text-sm text-gray-800 font-semibold group-hover:text-gp-cobalt transition-colors">
                    {txn.account}
                  </span>
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
                    {txn.type === 'credit'
                      ? <ArrowDownLeft size={12} />
                      : <ArrowUpRight size={12} />}
                    {txn.type}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={txn.status} />
                </TableCell>
                <TableCell className="font-mono text-text-xs text-gray-400">
                  {txn.timestamp}
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <ChevronRight size={16} className="ml-auto text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-gp-cobalt" />
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        {sorted.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-display text-text-lg font-semibold text-gray-900">No transactions found</p>
            <p className="mt-1 font-sans text-text-sm text-gray-500">Try another search or status filter.</p>
          </div>
        )}
      </SectionCard>
    </PageTransition>
  );
};
