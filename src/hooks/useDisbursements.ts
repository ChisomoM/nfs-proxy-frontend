import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import type { DisbursementField, DisbursementRow, DisbursementRowData, ActiveCell, BulkTransferItem, BulkTransferResponse, TransferResults } from '@/types/disbursement'
import {
  DEFAULT_SCHEMA,
  validateRow,
  validateAllRows,
  computeSummary,
} from '@/lib/validations/disbursement'
import { generateTemplateCsv } from '@/lib/disbursementTemplate'
import { normalizePhoneNumber } from '@/lib/utils'
import { BulkFundTransferService } from '@/lib/api/services'

const BATCH_SIZE = 100
const PAGE_SIZE = 25

function parseCSV(file: File, schema: DisbursementField[]): Promise<DisbursementRowData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as string[][]
        if (!rows.length) {
          reject(new Error('CSV file appears to be empty or malformed'))
          return
        }

        const [headerRow, ...dataRows] = rows

        if (!dataRows.length) {
          reject(new Error('No data rows found in the file'))
          return
        }

        const keyMap: Record<number, string> = {}
        let matched = 0
        headerRow.forEach((label, idx) => {
          const clean = label.trim().toLowerCase()
          const field = schema.find(
            f => f.label.toLowerCase() === clean || f.key.toLowerCase() === clean,
          )
          if (field) { keyMap[idx] = field.key; matched++ }
        })

        if (matched < schema.filter(f => f.required).length) {
          const unmatched = schema.length - matched
          if (unmatched > 0) {
            toast.warning(`${unmatched} column(s) in your CSV could not be matched and were ignored`)
          }
        }

        // Filter out description/metadata rows (e.g., rows starting with field descriptions)
        const actualDataRows = dataRows.filter(row => {
          // Skip rows where cells look like descriptions (contain ":" or pattern like "Text. Required")
          return !row.some(cell => cell.includes(':') || cell.includes('Required') || cell.includes('Optional'))
        })

        if (!actualDataRows.length) {
          reject(new Error('No valid data rows found in the file'))
          return
        }

        const parsed = actualDataRows.map(row => {
          const obj: DisbursementRowData = {}
          row.forEach((cell, idx) => {
            if (keyMap[idx] !== undefined) obj[keyMap[idx]] = cell.trim()
          })
          return obj
        })
        resolve(parsed)
      },
      error: (err) => reject(new Error(err.message)),
    })
  })
}

export interface UseDisbursementsReturn {
  schema: DisbursementField[]
  schemaLoading: boolean
  rows: DisbursementRow[]
  pagedRows: DisbursementRow[]
  currentPage: number
  totalPages: number
  summary: any
  canSubmit: boolean
  isSubmitting: boolean
  showConfirmModal: boolean
  isDragging: boolean
  totalAmount: number
  totalRecipients: number
  transferResults: TransferResults | null
  pendingActiveCell: React.MutableRefObject<ActiveCell | null>
  setCurrentPage: (page: number) => void
  setIsDragging: (dragging: boolean) => void
  handleFileParsed: (file: File) => Promise<void>
  handleRowEdit: (rowId: string, fieldKey: string, newValue: string) => void
  handleRowDelete: (rowId: string) => void
  resetRows: () => void
  handleDownloadTemplate: () => void
  handleSubmit: () => void
  handleConfirmSubmit: () => Promise<void>
  handleCancelSubmit: () => void
  handleTabPastLastRow: () => void
}

export function useDisbursements() {
  const [schema, setSchema]               = useState<DisbursementField[]>(DEFAULT_SCHEMA)
  const [schemaLoading, setSchemaLoading] = useState(true)
  const [rows, setRows]                   = useState<DisbursementRow[]>([])
  const [currentPage, setCurrentPage]     = useState(1)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isDragging, setIsDragging]       = useState(false)
  const [transferResults, setTransferResults] = useState<TransferResults | null>(null)
  const pendingActiveCell                 = useRef<ActiveCell | null>(null)

  useEffect(() => {
    // Always use DEFAULT_SCHEMA (fixed required NFS fields) for CSV parsing
    setSchema(DEFAULT_SCHEMA)
    setSchemaLoading(false)
  }, [])

  const handleFileParsed = async (file: File) => {
    try {
      const parsed = await parseCSV(file, schema)
      const withIds: DisbursementRow[] = parsed.map(data => ({
        id: crypto.randomUUID(),
        data,
        errors: {},
      }))
      const validated = validateAllRows(withIds, schema)
      setRows(validated)
      setCurrentPage(1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse CSV')
    }
  }

  const handleRowEdit = (rowId: string, fieldKey: string, newValue: string) => {
    setRows(prev =>
      prev.map(row => {
        if (row.id !== rowId) return row
        const updatedData = { ...row.data, [fieldKey]: newValue }
        return { ...row, data: updatedData, errors: validateRow(updatedData, schema) }
      }),
    )
  }

  const handleRowDelete = (rowId: string) => {
    setRows(prev => {
      const next = prev.filter(r => r.id !== rowId)
      const maxPage = Math.max(1, Math.ceil(next.length / PAGE_SIZE))
      if (currentPage > maxPage) setCurrentPage(maxPage)
      return next
    })
  }

  const resetRows = () => {
    setRows([])
    setCurrentPage(1)
  }

  const handleDownloadTemplate = () => generateTemplateCsv(DEFAULT_SCHEMA)

  const handleSubmit = () => setShowConfirmModal(true)

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Map rows to BulkTransferItem[], chunking at 100
      const items: BulkTransferItem[] = rows.map(r => ({
        amount: Number(r.data['amount']) || 0,
        sender: { msisdn: normalizePhoneNumber(r.data['sender_msisdn'] || '') },
        reciever: {
          msisdn: normalizePhoneNumber(r.data['receiver_msisdn'] || ''),
          pan: r.data['receiver_pan'] ? r.data['receiver_pan'] : undefined,
        },
        participant_id: r.data['participant_id'] || '',
        narration: r.data['narration'] ? r.data['narration'] : undefined,
      }))

      // Submit in batches of 100 sequentially
      const batches: BulkTransferResponse[] = []
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE)
        const response = await BulkFundTransferService.submit(batch)
        batches.push(response)
      }

      // Merge all results
      const totalAmount = rows.reduce((sum, r) => sum + (Number(r.data['amount']) || 0), 0)

      const results = {
        batches,
        totalRecipients: rows.length,
        totalAmount,
      }
      console.log('[useDisbursements] setting transferResults:', results)
      setTransferResults(results)

      toast.success(`${batches.length} batch(es) submitted — ${rows.length} recipients queued`)
      setRows([])
      setCurrentPage(1)
      setShowConfirmModal(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelSubmit = () => {
    if (!isSubmitting) setShowConfirmModal(false)
  }

  const handleTabPastLastRow = () => {
    const totalPages = Math.ceil(rows.length / PAGE_SIZE)
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      const firstRowOnNextPage = rows[(nextPage - 1) * PAGE_SIZE]
      if (firstRowOnNextPage) {
        pendingActiveCell.current = { rowId: firstRowOnNextPage.id, fieldKey: schema[0]?.key ?? '' }
      }
    }
  }

  const summary          = computeSummary(rows)
  const canSubmit        = rows.length > 0 && summary.invalid === 0
  const totalRecipients  = rows.length
  const amountField      = schema.find(f => f.key === 'amount') ?? schema.find(f => f.type === 'number')
  const totalAmount      = amountField
    ? rows.reduce((sum, r) => sum + (Number(r.data[amountField.key]) || 0), 0)
    : 0
  const totalPages       = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const pagedRows        = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return {
    schema,
    schemaLoading,
    rows,
    pagedRows,
    currentPage,
    totalPages,
    summary,
    canSubmit,
    isSubmitting,
    showConfirmModal,
    isDragging,
    totalAmount,
    totalRecipients,
    transferResults,
    pendingActiveCell,
    setCurrentPage,
    setIsDragging,
    handleFileParsed,
    handleRowEdit,
    handleRowDelete,
    resetRows,
    handleDownloadTemplate,
    handleSubmit,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleTabPastLastRow,
  } as const
}
