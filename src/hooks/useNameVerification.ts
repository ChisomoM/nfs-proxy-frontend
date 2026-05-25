import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import type {
  DisbursementField,
  DisbursementRow,
  VerificationStatus,
  VerificationResult,
  VerifiedDisbursementRow,
  BulkNameLookupItem,
  BulkNameLookupItemResult,
  BulkNameLookupResultEvent,
  BulkNameLookupCompleteEvent,
} from '@/types/disbursement'
import { BulkNameLookupService } from '@/lib/api/services'
import { onEvent, offEvent, getSocket } from '@/lib/api/socket'
import { nameSimilarity, classifyMatch } from '@/lib/utils/nameMatcher'
import { normalizePhoneNumber } from '@/lib/utils'

function buildLookupItem(row: DisbursementRow): BulkNameLookupItem {
  const rawPhone = row.data['receiver_msisdn'] ?? ''
  const participantId = row.data['participant_id'] ?? ''
  return {
    msisdn: rawPhone ? normalizePhoneNumber(rawPhone) : undefined,
    participant_id: participantId,
  }
}

function toVerificationResult(
  result: BulkNameLookupItemResult,
  csvName: string,
): VerificationResult {
  if (!result.success) {
    return {
      status: 'lookup-failed',
      retrievedName: null,
      retrievedParticipantId: null,
      similarity: 0,
      participantIdMatch: false,
      errorMessage: result.error ?? result.error_code ?? 'Lookup failed',
      elapsed_ms: result.elapsed_ms,
    }
  }
  const retrievedName = result.name || null
  const retrievedParticipantId = result.participant_id || null
  // const participantIdMatch = csvParticipantId === retrievedParticipantId
  const nameStatus = classifyMatch(csvName, retrievedName)
  const similarity = retrievedName ? nameSimilarity(csvName, retrievedName) : 0

  // For now, only use nameStatus for verification
  // TODO: Revisit participant_id validation later when we clarify sender vs receiver participant_id logic
  let status: VerificationStatus = nameStatus
  // if (participantIdMatch && nameStatus === 'exact-match') {
  //   status = 'exact-match'
  // } else if ((participantIdMatch || nameStatus === 'exact-match') && (participantIdMatch || nameStatus !== 'no-match')) {
  //   status = 'partial-match'
  // } else {
  //   status = 'no-match'
  // }

  return {
    status,
    retrievedName,
    retrievedParticipantId,
    similarity,
    participantIdMatch: false, // CSV participant_id is sender's, not receiver's, so no meaningful match comparison
    elapsed_ms: result.elapsed_ms,
  }
}

function applyResult(
  prev: VerifiedDisbursementRow[],
  result: BulkNameLookupItemResult,
): VerifiedDisbursementRow[] {
  const next = [...prev]
  const rowIdx = next.findIndex(r => {
    const msisdn = r.data['receiver_msisdn']
      ? normalizePhoneNumber(r.data['receiver_msisdn'])
      : undefined
    return (result.msisdn && msisdn === result.msisdn) ||
           (result.pan && r.data['receiver_pan'] === result.pan)
  })
  if (rowIdx === -1) return next
  const csvName = next[rowIdx].data['receiver_name'] ?? ''
  next[rowIdx] = {
    ...next[rowIdx],
    verification: toVerificationResult(result, csvName),
  }
  return next
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

export function useNameVerification(onRowRemove?: (rowId: string) => void) {
  const [verifiedRows, setVerifiedRows] = useState<VerifiedDisbursementRow[]>([])
  const [verificationPhase, setVerificationPhase] = useState<VerificationPhase>('idle')
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Tracks the active batch so socket handlers and reconnect backfill can reference it
  const activeBatchRef = useRef<{ batchId: string; total: number } | null>(null)
  // Polling fallback interval — used when socket is unavailable
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Socket listener helpers ──────────────────────────────────────────────

  const handleResultEvent = useCallback((data: BulkNameLookupResultEvent) => {
    console.log('[verify] result event received', data)
    if (!activeBatchRef.current || data.batch_id !== activeBatchRef.current.batchId) {
      console.warn('[verify] result event ignored — batch mismatch or no active batch', { active: activeBatchRef.current?.batchId, received: data.batch_id })
      return
    }
    setVerifiedRows(prev => applyResult(prev, data.result))
    setProgress(prev => ({ ...prev, completed: prev.completed + 1 }))
  }, [])

  const handleCompleteEvent = useCallback((data: BulkNameLookupCompleteEvent) => {
    console.log('[verify] complete event received', data)
    if (!activeBatchRef.current || data.batch_id !== activeBatchRef.current.batchId) {
      console.warn('[verify] complete event ignored — batch mismatch or no active batch', { active: activeBatchRef.current?.batchId, received: data.batch_id })
      return
    }
    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    offEvent('emoney.bulk_name_lookup.result', handleResultEvent)
    offEvent('emoney.bulk_name_lookup.complete', handleCompleteEvent)
    activeBatchRef.current = null
    setVerificationPhase(prev => prev === 'running' ? 'done' : prev)
  }, [handleResultEvent])

  // ─── Reconnect backfill ───────────────────────────────────────────────────

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onReconnect = async () => {
      const batch = activeBatchRef.current
      if (!batch) return
      try {
        const status = await BulkNameLookupService.getStatus(batch.batchId)
        for (const result of status.results) {
          setVerifiedRows(prev => applyResult(prev, result))
        }
        setProgress({ completed: status.completed, total: status.total })
        if (status.completed >= status.total) {
          offEvent('emoney.bulk_name_lookup.result', handleResultEvent)
          offEvent('emoney.bulk_name_lookup.complete', handleCompleteEvent)
          activeBatchRef.current = null
          setVerificationPhase('done')
        }
      } catch {
        // backfill failed — user can retry
      }
    }

    socket.on('connect', onReconnect)
    return () => { socket.off('connect', onReconnect) }
  }, [handleResultEvent, handleCompleteEvent])

  // ─── Core submit helper ───────────────────────────────────────────────────

  const submitBatch = useCallback(async (
    rows: VerifiedDisbursementRow[],
    markPending: boolean,
  ) => {
    console.log('[verify] submitBatch called — rows:', rows.length, 'items:', rows.map(r => buildLookupItem(r)))
    const items = rows.map(r => buildLookupItem(r))

    if (markPending) {
      setVerifiedRows(prev =>
        prev.map(r =>
          rows.some(fr => fr.id === r.id)
            ? { ...r, verification: { status: 'pending', retrievedName: null, retrievedParticipantId: null, similarity: 0, participantIdMatch: false } }
            : r,
        )
      )
    }

    // Register listeners before submitting so no result events are missed
    // during the network round-trip for the 202 response.
    onEvent('emoney.bulk_name_lookup.result', handleResultEvent)
    onEvent('emoney.bulk_name_lookup.complete', handleCompleteEvent)

    let batchId: string
    let total: number
    try {
      console.log('[verify] calling BulkNameLookupService.submit with', items.length, 'items')
      const res = await BulkNameLookupService.submit(items)
      console.log('[verify] submit response:', res)
      batchId = res.batch_id
      total = res.total
    } catch (err) {
      console.error('[verify] submit threw:', err)
      offEvent('emoney.bulk_name_lookup.result', handleResultEvent)
      offEvent('emoney.bulk_name_lookup.complete', handleCompleteEvent)
      setVerifiedRows(prev =>
        prev.map(r =>
          rows.some(fr => fr.id === r.id)
            ? { ...r, verification: { status: 'lookup-failed', retrievedName: null, retrievedParticipantId: null, similarity: 0, participantIdMatch: false, errorMessage: 'Network error' } }
            : r,
        )
      )
      setVerificationPhase('error')
      toast.error('Could not submit verification batch. Check your connection.')
      return
    }

    console.log('[verify] batch accepted — batchId:', batchId, 'total:', total)
    activeBatchRef.current = { batchId, total }
    setProgress({ completed: 0, total })

    // Polling fallback — activates when socket is not connected at submission time.
    // applyResult is idempotent so overlapping socket events + polls are safe.
    if (!getSocket()?.connected) {
      console.log('[verify] socket not connected — starting poll fallback for batch', batchId)
      if (pollIntervalRef.current !== null) clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = setInterval(async () => {
        const batch = activeBatchRef.current
        if (!batch) {
          if (pollIntervalRef.current !== null) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null }
          return
        }
        try {
          const status = await BulkNameLookupService.getStatus(batch.batchId)
          console.log('[verify] poll:', status.completed, '/', status.total, 'results so far')
          setVerifiedRows(prev =>
            (status.results as BulkNameLookupItemResult[]).reduce(
              (acc, result) => applyResult(acc, result),
              prev,
            )
          )
          setProgress({ completed: status.completed, total: status.total })
          if (status.completed >= status.total) {
            if (pollIntervalRef.current !== null) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null }
            offEvent('emoney.bulk_name_lookup.result', handleResultEvent)
            offEvent('emoney.bulk_name_lookup.complete', handleCompleteEvent)
            activeBatchRef.current = null
            setVerificationPhase('done')
          }
        } catch (err) {
          console.error('[verify] poll error:', err)
          if (pollIntervalRef.current !== null) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null }
        }
      }, 1500)
    }
  }, [handleResultEvent, handleCompleteEvent])

  // ─── Start verification ───────────────────────────────────────────────────

  const startVerification = useCallback(async (
    rows: DisbursementRow[],
    _schema: DisbursementField[],
  ) => {
    if (rows.length === 0) return

    const initialRows: VerifiedDisbursementRow[] = rows.map(row => ({
      ...row,
      verification: { status: 'pending', retrievedName: null, retrievedParticipantId: null, similarity: 0, participantIdMatch: false },
    }))
    setVerifiedRows(initialRows)
    setVerificationPhase('running')
    setFilter('all')
    setSelected(new Set())

    await submitBatch(initialRows, false)
  }, [submitBatch])

  // ─── Retry failed rows ────────────────────────────────────────────────────

  const retryFailed = useCallback(async () => {
    const failedRows = verifiedRows.filter(r => r.verification.status === 'lookup-failed')
    if (failedRows.length === 0) return
    setVerificationPhase('running')
    await submitBatch(failedRows, true)
  }, [verifiedRows, submitBatch])

  // ─── Retry a single row ───────────────────────────────────────────────────

  const retryRow = useCallback(async (rowId: string) => {
    const row = verifiedRows.find(r => r.id === rowId)
    if (!row) return
    setVerificationPhase('running')
    await submitBatch([row], true)
  }, [verifiedRows, submitBatch])

  // ─── Row management ───────────────────────────────────────────────────────

  const removeRow = useCallback((rowId: string) => {
    setVerifiedRows(prev => prev.filter(r => r.id !== rowId))
    setSelected(prev => {
      const next = new Set(prev)
      next.delete(rowId)
      return next
    })
    // Also remove from disbursement rows to keep totals in sync
    onRowRemove?.(rowId)
  }, [onRowRemove])

  const removeSelected = useCallback(() => {
    // Collect IDs to remove
    const toRemove = Array.from(selected)
    setVerifiedRows(prev => prev.filter(r => !selected.has(r.id)))
    setSelected(new Set())
    // Remove from disbursement rows to keep totals in sync
    toRemove.forEach(id => onRowRemove?.(id))
  }, [selected, onRowRemove])

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
    if (pollIntervalRef.current !== null) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null }
    offEvent('emoney.bulk_name_lookup.result', handleResultEvent)
    offEvent('emoney.bulk_name_lookup.complete', handleCompleteEvent)
    activeBatchRef.current = null
    setVerifiedRows([])
    setVerificationPhase('idle')
    setProgress({ completed: 0, total: 0 })
    setFilter('all')
    setSelected(new Set())
  }, [handleResultEvent, handleCompleteEvent])

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
