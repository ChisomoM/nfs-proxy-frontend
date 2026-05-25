import React from 'react'
import { motion } from 'framer-motion'
import { Link, ExternalLink, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { TransferResults } from '@/types/disbursement'
import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TransferResultsTableProps {
  transferResults: TransferResults
  onRefresh?: () => void
}

export const TransferResultsTable: React.FC<TransferResultsTableProps> = ({
  transferResults,
  onRefresh,
}) => {
  const navigate = useNavigate()
  console.log('[TransferResultsTable] rendering with:', { batches: transferResults.batches.length, totalRecipients: transferResults.totalRecipients })

  const allResults = transferResults.batches.flatMap(batch => batch.results || [])

  const statusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'processing':
        return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Sticky info banner */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3"
      >
        <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="font-sans text-text-sm text-blue-700">
          <strong>Transfer submitted.</strong> Statuses shown are initial and may change as processing completes. Refresh this page to see updates.
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Recipients"
          value={String(transferResults.totalRecipients)}
        />
        <SummaryCard
          label="Total Amount"
          value={formatCurrency(transferResults.totalAmount)}
        />
        <SummaryCard
          label="Batches Submitted"
          value={String(transferResults.batches.length)}
        />
        <SummaryCard
          label="Status"
          value={
            allResults.every(r => r.status === 'completed')
              ? 'Complete'
              : allResults.some(r => r.status === 'failed')
              ? 'Some Failed'
              : 'Processing'
          }
        />
      </div>

      {/* Results table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                <TableHead className="h-12 font-sans font-semibold text-text-xs text-gray-700 px-4">
                  Reference ID
                </TableHead>
                <TableHead className="h-12 font-sans font-semibold text-text-xs text-gray-700 px-4">
                  Recipient
                </TableHead>
                <TableHead className="h-12 font-sans font-semibold text-text-xs text-gray-700 px-4">
                  Participant ID
                </TableHead>
                <TableHead className="h-12 font-sans font-semibold text-text-xs text-gray-700 px-4 text-right">
                  Amount
                </TableHead>
                <TableHead className="h-12 font-sans font-semibold text-text-xs text-gray-700 px-4">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allResults.map((result, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="h-12 px-4 font-mono text-text-xs text-gray-700">
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      {result.reference_id.slice(0, 12)}…
                    </code>
                  </TableCell>
                  <TableCell className="h-12 px-4 font-sans text-text-sm text-gray-700">
                    {result.reciever.msisdn}
                  </TableCell>
                  <TableCell className="h-12 px-4 font-mono text-text-sm text-gray-700">
                    {result.participant_id || '—'}
                  </TableCell>
                  <TableCell className="h-12 px-4 font-sans text-text-sm text-gray-900 font-medium text-right">
                    {formatCurrency(result.amount)}
                  </TableCell>
                  <TableCell className="h-12 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-text-xs font-medium ${statusColor(result.status)}`}>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={() => navigate('/merchant/transactions')}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-sans font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
        >
          <ExternalLink size={14} />
          View Transactions
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          onClick={onRefresh}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-sans font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
        >
          <Link size={14} />
          Refresh Status
        </motion.button>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value }) => (
  <motion.div
    initial={{ opacity: 0, y: -2 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center"
  >
    <p className="font-sans text-text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-sans font-semibold text-gray-900">{value}</p>
  </motion.div>
)
