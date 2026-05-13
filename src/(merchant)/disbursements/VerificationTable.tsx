import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Trash2, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableHeaderRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { DisbursementField, VerifiedDisbursementRow } from '@/types/disbursement'
import { VerificationStatusBadge } from './VerificationStatusBadge'
import { TablePagination } from './TablePagination'

const PAGE_SIZE = 25

interface VerificationTableProps {
  rows: VerifiedDisbursementRow[]
  selected: Set<string>
  schema: DisbursementField[]
  currentPage: number
  totalPages: number
  onToggleSelect: (rowId: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onDelete: (rowId: string) => void
  onRetryRow: (rowId: string) => void
  onPageChange: (page: number) => void
}

// Row background by verification status
function rowBg(status: VerifiedDisbursementRow['verification']['status']): string {
  switch (status) {
    case 'partial-match': return 'bg-amber-50/40'
    case 'no-match':      return 'bg-red-50/40'
    case 'lookup-failed': return 'bg-gray-50'
    default:              return ''
  }
}

export const VerificationTable: React.FC<VerificationTableProps> = ({
  rows,
  selected,
  schema,
  currentPage,
  totalPages,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onDelete,
  onRetryRow,
  onPageChange,
}) => {
  const pagedRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const allSelected = pagedRows.length > 0 && pagedRows.every(r => selected.has(r.id))
  const someSelected = pagedRows.some(r => selected.has(r.id))

  const handleSelectAllChange = () => {
    if (allSelected) {
      onClearSelection()
    } else {
      onSelectAll()
    }
  }

  // Find phone and amount field keys from schema
  const phoneKey  = schema.find(f => f.type === 'phone' || f.key === 'phone' || f.key === 'msisdn')?.key ?? 'phone'
  const nameKey   = schema.find(f => f.key === 'name')?.key ?? 'name'
  const amountKey = schema.find(f => f.type === 'number' || f.key === 'amount')?.key ?? 'amount'

  return (
    <div className="space-y-3">
      <div className="border-gradient bg-white rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableHeaderRow className="table-header-rule">
              {/* Row number */}
              <TableHead className="w-12 text-center">
                <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">
                  #
                </span>
              </TableHead>

              {/* Checkbox */}
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={handleSelectAllChange}
                  aria-label="Select all rows"
                />
              </TableHead>

              <TableHead>
                <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">
                  Phone
                </span>
              </TableHead>

              <TableHead>
                <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">
                  CSV Name
                </span>
              </TableHead>

              <TableHead>
                <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">
                  Retrieved Name
                </span>
              </TableHead>

              <TableHead>
                <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">
                  Match Status
                </span>
              </TableHead>

              <TableHead className="text-right">
                <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">
                  Amount
                </span>
              </TableHead>

              {/* Actions */}
              <TableHead className="w-20" />
            </TableHeaderRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence initial={false}>
              {pagedRows.map((row, rowIdx) => {
                const absIdx  = (currentPage - 1) * PAGE_SIZE + rowIdx + 1
                const status  = row.verification.status
                const isSelected = selected.has(row.id)

                return (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      'border-b border-gray-50 last:border-0 group',
                      rowBg(status),
                      isSelected && 'ring-1 ring-inset ring-gp-cobalt/20 bg-gp-cobalt-50/30',
                    )}
                  >
                    {/* Row number */}
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-mono text-text-xs text-gray-400 tabular-nums">
                        {absIdx}
                      </span>
                    </td>

                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(row.id)}
                        aria-label={`Select row ${absIdx}`}
                      />
                    </td>

                    {/* Phone / Identifier */}
                    <td className="py-2.5 px-4">
                      <span className="font-mono text-text-sm text-gray-700 tabular-nums">
                        {row.data[phoneKey] || '—'}
                      </span>
                    </td>

                    {/* CSV Name */}
                    <td className="py-2.5 px-4">
                      <span className="font-sans text-text-sm text-gray-800">
                        {row.data[nameKey] || '—'}
                      </span>
                    </td>

                    {/* Retrieved Name */}
                    <td className="py-2.5 px-4 min-w-[140px]">
                      {status === 'pending' ? (
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={row.verification.retrievedName ?? 'empty'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              'font-sans text-text-sm',
                              status === 'lookup-failed' ? 'text-gray-400' : 'text-gray-800',
                            )}
                          >
                            {row.verification.retrievedName ?? '—'}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </td>

                    {/* Match Status badge */}
                    <td className="py-2.5 px-4">
                      <VerificationStatusBadge status={status} />
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-4 text-right">
                      <span className="font-mono text-text-sm text-gray-700 tabular-nums">
                        {row.data[amountKey]
                          ? Number(row.data[amountKey]).toLocaleString()
                          : '—'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Retry — only for lookup-failed */}
                        {status === 'lookup-failed' && (
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            transition={{ type: 'spring', stiffness: 600, damping: 32 }}
                            onClick={e => { e.stopPropagation(); onRetryRow(row.id) }}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gp-cobalt-700 hover:bg-gp-cobalt-100 transition-colors duration-150"
                            aria-label="Retry verification"
                          >
                            <RefreshCw size={14} />
                          </motion.button>
                        )}

                        {/* Delete — always shown, fades in on hover */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 600, damping: 32 }}
                          onClick={e => { e.stopPropagation(); onDelete(row.id) }}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-danger-fg hover:bg-danger-light transition-colors duration-150 opacity-0 group-hover:opacity-100"
                          aria-label="Delete row"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={rows.length}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
