import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type {
  DisbursementField,
  DisbursementRow,
  VerificationStatus,
  VerificationResult,
  VerifiedDisbursementRow,
  BulkNameLookupItem,
  BulkNameLookupItemResult,
} from '@/types/disbursement'
import { BulkNameLookupService } from '@/lib/api/services'
import { nameSimilarity, classifyMatch } from '@/lib/utils/nameMatcher'

const CHUNK_SIZE = 10
const PARTICIPANT_ID = '000261'

/**
 * Normalise a raw phone value from the CSV into a 9-digit msisdn string.
 * Strips a leading '+' and a leading '260' country code if present.
 * Returns the value as-is when it is already 9 digits or shorter.
 */
function normalisePhone(raw: string): string {
  let s = raw.replace(/\s+/g, '').replace(/^\+/, '')
  if (s.startsWith('260') && s.length > 9) {
    s = s.slice(3)
  }
  return s
}

/**
 * Build a BulkNameLookupItem from a DisbursementRow.
 * Reads `row.data.phone` (or `row.data.msisdn`) for the phone number.
 */
function buildLookupItem(row: DisbursementRow): BulkNameLookupItem {
  const rawPhone = row.data['phone'] ?? row.data['msisdn'] ?? ''
  return {
    msisdn: rawPhone ? normalisePhone(rawPhone) : undefined,
    participant_id: PARTICIPANT_ID,
  }
}

/**
 * Convert a single BulkNameLookupItemResult into a VerificationResult,
 * given the original CSV name for comparison.
 */
function toVerificationResult(
  result: BulkNameLookupItemResult,
  csvName: string,
): VerificationResult {
  if (!result.success) {
    return {
      status: 'lookup-failed',
      retrievedName: null,
      similarity: 0,
      errorMessage: result.error ?? result.error_code ?? 'Lookup failed',
      elapsed_ms: result.elapsed_ms,
    }
  }
  const retrievedName = result.name || null
  const status = classifyMatch(csvName, retrievedName)
  const similarity = retrievedName ? nameSimilarity(csvName, retrievedName) : 0
  return {
    status,
    retrievedName,
    similarity,
    elapsed_ms: result.elapsed_ms,
  }
}

export interface VerificationSummary {
  total: number
  exactMatch: number
  partialMatch: number
  noMatch: number
  failed: number
  pending: number
}

type VerificationPhase = 'idle' | 'running' | 'done' | 'error'

function computeSummary(rows: VerifiedDisbursementRow[]): VerificationSummary {
  const summary: VerificationSummary = {
    total: rows.length,
    exactMatch: 0,
    partialMatch: 0,
    noMatch: 0,
    failed: 0,
    pending: 0,
  }
  for (const row of rows) {
    switch (row.verification.status) {
      case 'exact-match':   summary.exactMatch++;   break
      case 'partial-match': summary.partialMatch++; break
      case 'no-match':      summary.noMatch++;      break
      case 'lookup-failed': summary.failed++;       break
      case 'pending':       summary.pending++;      break
    }
  }
  return summary
}

export function useNameVerification() {
  const [verifiedRows, setVerifiedRows] = useState<VerifiedDisbursementRow[]>([])
  const [verificationPhase, setVerificationPhase] = useState<VerificationPhase>('idle')
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // ─── Start verification ───────────────────────────────────────────────────

  const startVerification = useCallback(async (
    rows: DisbursementRow[],
    _schema: DisbursementField[],
  ) => {
    if (rows.length === 0) return

    // Reset state, seed all rows as 'pending'
    const initialRows: VerifiedDisbursementRow[] = rows.map(row => ({
      ...row,
      verification: { status: 'pending', retrievedName: null, similarity: 0 },
    }))
    setVerifiedRows(initialRows)
    setVerificationPhase('running')
    setProgress({ completed: 0, total: rows.length })
    setFilter('all')
    setSelected(new Set())

    let completed = 0
    let hasError = false

    for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
      const chunk = rows.slice(start, start + CHUNK_SIZE)
      const items: BulkNameLookupItem[] = chunk.map(buildLookupItem)

      try {
        const response = await BulkNameLookupService.verify(items)

        setVerifiedRows(prev => {
          const next = [...prev]
          chunk.forEach((row, idx) => {
            const rowIdx = next.findIndex(r => r.id === row.id)
            if (rowIdx === -1) return
            const result = response.results[idx]
            if (!result) {
              // Should not happen, but guard anyway
              next[rowIdx] = {
                ...next[rowIdx],
                verification: {
                  status: 'lookup-failed',
                  retrievedName: null,
                  similarity: 0,
                  errorMessage: 'No result returned',
                },
              }
            } else {
              const csvName = row.data['name'] ?? ''
              next[rowIdx] = {
                ...next[rowIdx],
                verification: toVerificationResult(result, csvName),
              }
            }
          })
          return next
        })
      } catch {
        // Entire chunk failed (network error) — mark all as lookup-failed
        hasError = true
        setVerifiedRows(prev => {
          const next = [...prev]
          chunk.forEach(row => {
            const rowIdx = next.findIndex(r => r.id === row.id)
            if (rowIdx === -1) return
            next[rowIdx] = {
              ...next[rowIdx],
              verification: {
                status: 'lookup-failed',
                retrievedName: null,
                similarity: 0,
                errorMessage: 'Network error',
              },
            }
          })
          return next
        })
      }

      completed += chunk.length
      setProgress({ completed, total: rows.length })
    }

    setVerificationPhase(hasError ? 'error' : 'done')

    if (hasError) {
      toast.error('Some accounts could not be verified. Retry failed rows or remove them.')
    }
  }, [])

  // ─── Retry failed rows ────────────────────────────────────────────────────

  const retryFailed = useCallback(async () => {
    const failedRows = verifiedRows.filter(r => r.verification.status === 'lookup-failed')
    if (failedRows.length === 0) return

    // Mark them back to pending
    setVerifiedRows(prev =>
      prev.map(r =>
        r.verification.status === 'lookup-failed'
          ? { ...r, verification: { status: 'pending', retrievedName: null, similarity: 0 } }
          : r,
      ),
    )
    setVerificationPhase('running')
    setProgress({ completed: 0, total: failedRows.length })

    let completed = 0
    let hasError = false

    for (let start = 0; start < failedRows.length; start += CHUNK_SIZE) {
      const chunk = failedRows.slice(start, start + CHUNK_SIZE)
      const items: BulkNameLookupItem[] = chunk.map(buildLookupItem)

      try {
        const response = await BulkNameLookupService.verify(items)

        setVerifiedRows(prev => {
          const next = [...prev]
          chunk.forEach((row, idx) => {
            const rowIdx = next.findIndex(r => r.id === row.id)
            if (rowIdx === -1) return
            const result = response.results[idx]
            const csvName = row.data['name'] ?? ''
            next[rowIdx] = {
              ...next[rowIdx],
              verification: result
                ? toVerificationResult(result, csvName)
                : { status: 'lookup-failed', retrievedName: null, similarity: 0, errorMessage: 'No result returned' },
            }
          })
          return next
        })
      } catch {
        hasError = true
        setVerifiedRows(prev => {
          const next = [...prev]
          chunk.forEach(row => {
            const rowIdx = next.findIndex(r => r.id === row.id)
            if (rowIdx === -1) return
            next[rowIdx] = {
              ...next[rowIdx],
              verification: {
                status: 'lookup-failed',
                retrievedName: null,
                similarity: 0,
                errorMessage: 'Network error',
              },
            }
          })
          return next
        })
      }

      completed += chunk.length
      setProgress({ completed, total: failedRows.length })
    }

    setVerificationPhase(hasError ? 'error' : 'done')
  }, [verifiedRows])

  // ─── Retry a single row ───────────────────────────────────────────────────

  const retryRow = useCallback(async (rowId: string) => {
    const row = verifiedRows.find(r => r.id === rowId)
    if (!row) return

    // Mark as pending
    setVerifiedRows(prev =>
      prev.map(r =>
        r.id === rowId
          ? { ...r, verification: { status: 'pending', retrievedName: null, similarity: 0 } }
          : r,
      ),
    )

    try {
      const response = await BulkNameLookupService.verify([buildLookupItem(row)])
      const result = response.results[0]
      const csvName = row.data['name'] ?? ''

      setVerifiedRows(prev =>
        prev.map(r =>
          r.id === rowId
            ? {
                ...r,
                verification: result
                  ? toVerificationResult(result, csvName)
                  : { status: 'lookup-failed', retrievedName: null, similarity: 0, errorMessage: 'No result returned' },
              }
            : r,
        ),
      )
    } catch {
      setVerifiedRows(prev =>
        prev.map(r =>
          r.id === rowId
            ? {
                ...r,
                verification: {
                  status: 'lookup-failed',
                  retrievedName: null,
                  similarity: 0,
                  errorMessage: 'Network error',
                },
              }
            : r,
        ),
      )
    }
  }, [verifiedRows])

  // ─── Row management ───────────────────────────────────────────────────────

  const removeRow = useCallback((rowId: string) => {
    setVerifiedRows(prev => prev.filter(r => r.id !== rowId))
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(rowId)
      return next
    })
  }, [])

  const removeSelected = useCallback(() => {
    setVerifiedRows(prev => prev.filter(r => !selected.has(r.id)))
    setSelected(new Set())
  }, [selected])

  // ─── Selection ────────────────────────────────────────────────────────────

  const toggleSelect = useCallback((rowId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }, [])

  const selectAll = useCallback((rowIds: string[]) => {
    setSelected(new Set(rowIds))
  }, [])

  const clearSelection = useCallback(() => {
    setSelected(new Set())
  }, [])

  // ─── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setVerifiedRows([])
    setVerificationPhase('idle')
    setProgress({ completed: 0, total: 0 })
    setFilter('all')
    setSelected(new Set())
  }, [])

  // ─── Derived values ───────────────────────────────────────────────────────

  const filteredRows =
    filter === 'all'
      ? verifiedRows
      : verifiedRows.filter(r => r.verification.status === filter)

  const summary = computeSummary(verifiedRows)

  const canSubmit =
    verificationPhase !== 'running' &&
    summary.total > 0 &&
    summary.noMatch === 0 &&
    summary.failed === 0 &&
    summary.pending === 0

  return {
    verifiedRows,
    verificationPhase,
    progress,
    filter,
    selected,
    summary,
    filteredRows,
    canSubmit,
    startVerification,
    retryFailed,
    retryRow,
    removeRow,
    removeSelected,
    toggleSelect,
    selectAll,
    clearSelection,
    setFilter,
    reset,
  }
}
