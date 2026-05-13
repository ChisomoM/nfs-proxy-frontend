import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowLeftRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { SectionCard } from '@/components/shared/SectionCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const mockTransactions = [
  { id: 'TXN-001', merchant: 'Merchant ABC Ltd',  amount: 'ZMW 12,450.75', status: 'completed' as const, bank: 'Bank A', timestamp: '2024-01-15 14:30' },
  { id: 'TXN-002', merchant: 'Merchant XYZ Corp', amount: 'ZMW 890.00',    status: 'pending'   as const, bank: 'Bank B', timestamp: '2024-01-15 13:15' },
  { id: 'TXN-003', merchant: 'Merchant DEF Inc',  amount: 'ZMW 2,500.50',  status: 'failed'    as const, bank: 'Bank A', timestamp: '2024-01-15 12:00' },
];

const totalVolume = 'ZMW 15,841.25';
const successRate = '33.3%';

export const AdminTransactions: React.FC = () => {
  const { sorted, sortColumn, sortDirection, handleSort } = useTableSort(mockTransactions);

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Transactions"
        subtitle="Monitor all payment transactions across the platform."
      />

      {/* System Status Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard icon={<Activity />} label="Switch Status" value="Online" iconVariant="success" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<CheckCircle2 />} label="Bank API Status" value="Connected" iconVariant="sky" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<Clock />} label="Settlement Status" value="Processing" iconVariant="warning" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={<ArrowLeftRight />} label="Success Rate" value={successRate} iconVariant="cobalt" />
        </motion.div>
      </motion.div>

      {/* Transaction List */}
      <SectionCard
        title="All Transactions"
        onGrayBg
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableHeaderRow>
              <TableHead className="pl-6">ID</TableHead>
              <SortableTableHead sortKey="merchant" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Merchant</SortableTableHead>
              <SortableTableHead sortKey="amount" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Amount</SortableTableHead>
              <SortableTableHead sortKey="bank" sortColumn={sortColumn as string | null} sortDirection={sortDirection} onSort={handleSort as (key: string) => void}>Bank</SortableTableHead>
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
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer group"
              >
                <TableCell className="pl-6">
                  <code className="font-mono text-text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    {txn.id}
                  </code>
                </TableCell>
                <TableCell className="font-sans text-text-sm text-gray-700 font-medium group-hover:text-gp-cobalt transition-colors">
                  {txn.merchant}
                </TableCell>
                <TableCell className="font-mono text-text-sm text-gray-900 tabular-nums font-semibold">
                  {txn.amount}
                </TableCell>
                <TableCell className="font-sans text-text-sm text-gray-500">
                  {txn.bank}
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
      </SectionCard>

      {/* Platform Summary */}
      <SectionCard title="Platform Summary" onGrayBg>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Volume (24h)', value: totalVolume },
            { label: 'Active Merchants',  value: '1,247' },
            { label: 'Success Rate',      value: successRate },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-sans text-text-sm text-gray-400 font-medium mb-1.5">{label}</p>
              <p className="font-display font-bold text-display-xs text-gradient-stat tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageTransition>
  );
};
