import React from 'react';
import { motion } from 'framer-motion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { StatusBadge, type StatusType } from './StatusBadge';
import { MoreHorizontal, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Transaction {
  id: string;
  merchant: {
    name: string;
    initials: string;
    id: string;
  };
  type: StatusType;
  amount: number;
  currency: string;
  status: StatusType;
  timestamp: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-20260412-009182',
    merchant: { name: 'Airtel Money', initials: 'AM', id: 'MER-8821' },
    type: 'type-a',
    amount: 14500.00,
    currency: 'ZMW',
    status: 'completed',
    timestamp: '2 mins ago'
  },
  {
    id: 'TXN-20260412-009181',
    merchant: { name: 'MTN Mobile Money', initials: 'MTN', id: 'MER-4432' },
    type: 'type-b',
    amount: 8200.50,
    currency: 'ZMW',
    status: 'pending',
    timestamp: '15 mins ago'
  },
  {
    id: 'TXN-20260412-009180',
    merchant: { name: 'Zamtel Kwacha', initials: 'ZK', id: 'MER-1109' },
    type: 'type-a',
    amount: 2100.00,
    currency: 'ZMW',
    status: 'failed',
    timestamp: '1 hour ago'
  },
  {
    id: 'TXN-20260412-009179',
    merchant: { name: 'FNB Zambia', initials: 'FNB', id: 'MER-9012' },
    type: 'type-a',
    amount: 55000.00,
    currency: 'ZMW',
    status: 'completed',
    timestamp: '3 hours ago'
  },
  {
    id: 'TXN-20260412-009178',
    merchant: { name: 'Absa Bank', initials: 'AB', id: 'MER-5561' },
    type: 'type-b',
    amount: 12400.00,
    currency: 'ZMW',
    status: 'processing',
    timestamp: '5 hours ago'
  }
];

interface TransactionTableProps {
  transactions?: Transaction[];
  maxRows?: number;
  className?: string;
}

/**
 * High-fidelity Transaction Table component.
 * Adheres to financial data legibility rules: monospaced amounts, 
 * right-alignment, and spring physics.
 */
export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions = mockTransactions,
  maxRows = 5,
  className
}) => {
  const displayRows = transactions.slice(0, maxRows);

  if (displayRows.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-xl bg-gp-cobalt-100 flex items-center justify-center mb-4">
          <FileText size={26} className="text-gp-cobalt" />
        </div>
        <h3 className="font-display font-semibold text-text-xl text-gray-900 mb-2">
          No transactions yet
        </h3>
        <p className="font-sans text-text-sm text-gray-500 mb-6 max-w-xs px-4">
          Transactions processed through the GeePay NFS proxy will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 border-b border-gray-100">
            <TableHead className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wider py-4">
              Merchant
            </TableHead>
            <TableHead className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wider">
              Type
            </TableHead>
            <TableHead className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wider text-right">
              Amount
            </TableHead>
            <TableHead className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRows.map((txn, index) => (
            <motion.tr
              key={txn.id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ x: 2 }}
              className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors duration-150 cursor-pointer group"
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gp-cobalt-100 flex items-center justify-center text-gp-cobalt-600 font-display font-semibold text-text-sm">
                    {txn.merchant.initials}
                  </div>
                  <div>
                    <p className="font-sans font-medium text-text-sm text-gray-900">
                      {txn.merchant.name}
                    </p>
                    <p className="font-mono text-[10px] text-gray-400">
                      {txn.merchant.id}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={txn.type} />
              </TableCell>
              <TableCell className="text-right">
                <span className="font-mono font-medium text-text-sm text-gray-900 tabular-nums">
                  {txn.currency} {txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={txn.status} />
              </TableCell>
              <TableCell>
                <span className="font-mono text-text-xs text-gray-400">
                  {txn.timestamp}
                </span>
              </TableCell>
              <TableCell>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 group-hover:text-gray-600 hover:bg-white hover:shadow-sm transition-all duration-150"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </motion.button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
