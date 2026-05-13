import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableHeaderRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { DisbursementField, DisbursementRow } from '@/types/disbursement'
import type { ActiveCell } from '@/hooks/useDisbursements'

interface DisbursementTableProps {
  schema: DisbursementField[]
  rows: DisbursementRow[]
  currentPage: number
  pendingActiveCell: React.MutableRefObject<ActiveCell | null>
  onEdit: (rowId: string, fieldKey: string, newValue: string) => void
  onDelete: (rowId: string) => void
  onTabPastLastRow: () => void
}

export const DisbursementTable: React.FC<DisbursementTableProps> = ({
  schema,
  rows,
  currentPage,
  pendingActiveCell,
  onEdit,
  onDelete,
  onTabPastLastRow,
}) => {
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null)
  const [editValue, setEditValue]   = useState('')

  // Consume pending active cell after page change
  useEffect(() => {
    if (pendingActiveCell.current) {
      const next = pendingActiveCell.current
      pendingActiveCell.current = null
      // Small timeout so the new page rows have rendered
      setTimeout(() => {
        const target = rows.find(r => r.id === next.rowId)
        if (target) {
          setActiveCell(next)
          setEditValue(target.data[next.fieldKey] ?? '')
        }
      }, 50)
    }
  }, [currentPage, rows, pendingActiveCell])

  const activateCell = (rowId: string, fieldKey: string, currentValue: string) => {
    setActiveCell({ rowId, fieldKey })
    setEditValue(currentValue ?? '')
  }

  const saveEdit = (rowId: string, fieldKey: string, originalValue: string) => {
    const trimmed = editValue.trim()
    if (trimmed !== (originalValue ?? '').trim()) {
      onEdit(rowId, fieldKey, trimmed)
    }
    setActiveCell(null)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowId: string,
    fieldKey: string,
    originalValue: string,
    rowIdx: number,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit(rowId, fieldKey, originalValue)
    } else if (e.key === 'Escape') {
      setActiveCell(null)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      saveEdit(rowId, fieldKey, originalValue)

      const fieldIdx = schema.findIndex(f => f.key === fieldKey)
      const nextField = schema[fieldIdx + 1]

      if (nextField) {
        const row = rows.find(r => r.id === rowId)!
        activateCell(rowId, nextField.key, row.data[nextField.key] ?? '')
      } else {
        // Move to first field of next row
        const nextRow = rows[rowIdx + 1]
        if (nextRow) {
          activateCell(nextRow.id, schema[0].key, nextRow.data[schema[0].key] ?? '')
        } else {
          // Last row on this page
          onTabPastLastRow()
        }
      }
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="border-gradient bg-white rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableHeaderRow className="table-header-rule">
              <TableHead className="w-12 text-center">
                <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">#</span>
              </TableHead>
              {schema.map(field => (
                <TableHead key={field.key}>
                  <span className="font-sans font-medium text-text-xs text-gray-500 uppercase tracking-wide">
                    {field.label}
                    {field.required && <span className="text-danger-fg ml-0.5">*</span>}
                  </span>
                </TableHead>
              ))}
              <TableHead className="w-14" />
            </TableHeaderRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence initial={false}>
              {rows.map((row, rowIdx) => {
                const hasError = Object.keys(row.errors).length > 0
                const absIdx   = (currentPage - 1) * 25 + rowIdx + 1

                return (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ x: 2 }}
                    className={cn(
                      'border-b border-gray-50 last:border-0',
                      hasError ? 'bg-red-50/40' : '',
                    )}
                  >
                    {/* Row number */}
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-mono text-text-xs text-gray-400 tabular-nums">{absIdx}</span>
                    </td>

                    {/* Data cells */}
                    {schema.map(field => {
                      const isActive   = activeCell?.rowId === row.id && activeCell?.fieldKey === field.key
                      const cellError  = row.errors[field.key]
                      const cellValue  = row.data[field.key] ?? ''

                      return (
                        <td
                          key={field.key}
                          onClick={() => !isActive && activateCell(row.id, field.key, cellValue)}
                          className={cn(
                            'py-2 px-4 cursor-pointer group',
                            cellError && !isActive ? 'bg-red-50' : '',
                          )}
                        >
                          {isActive ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.97 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.12 }}
                            >
                              <Input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => saveEdit(row.id, field.key, cellValue)}
                                onKeyDown={e => handleKeyDown(e, row.id, field.key, cellValue, rowIdx)}
                                className={cn(
                                  'h-8 font-sans text-text-sm py-1 px-2',
                                  cellError ? 'ring-2 ring-danger border-danger' : '',
                                )}
                              />
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-2 min-h-[32px]">
                              <span
                                className={cn(
                                  'font-sans text-text-sm',
                                  cellError
                                    ? 'text-danger-fg'
                                    : cellValue
                                    ? 'text-gray-800'
                                    : 'text-gray-300 italic',
                                )}
                              >
                                {cellValue || '—'}
                              </span>
                              {cellError && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle
                                      size={13}
                                      className="text-danger-fg flex-shrink-0 cursor-help"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[220px] text-center">
                                    {cellError}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </td>
                      )
                    })}

                    {/* Delete cell */}
                    <td className="py-2 px-3 text-right">
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
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
