export interface DisbursementField {
  key: string
  label: string
  type: 'string' | 'number' | 'phone'
  required: boolean
  maxLength?: number
  example?: string
  // Human-readable description explaining the field and its validation rules
  description?: string
}

export type DisbursementRowData = Record<string, string>

export interface ActiveCell {
  rowId: string
  fieldKey: string
}

export interface DisbursementRow {
  id: string
  data: DisbursementRowData
  errors: Record<string, string>
}

export interface BulkDisbursementPayload {
  recipients: DisbursementRowData[]
}

export interface BulkDisbursementResponse {
  batch_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  total_count: number
  message?: string
}

export interface DisbursementConfigResponse {
  fields: DisbursementField[]
}

// ─── Name Verification ───────────────────────────────────────────────────────

export type VerificationStatus =
  | 'pending'
  | 'exact-match'
  | 'partial-match'
  | 'no-match'
  | 'lookup-failed'

export interface VerificationResult {
  status: VerificationStatus
  retrievedName: string | null
  retrievedParticipantId: string | null
  similarity: number   // 0–1
  participantIdMatch: boolean // exact match or not
  errorMessage?: string
  elapsed_ms?: number
}

export interface VerifiedDisbursementRow extends DisbursementRow {
  verification: VerificationResult
}

export interface BulkNameLookupItem {
  msisdn?: string
  pan?: string
  participant_id: string
}

export interface BulkNameLookupItemResult {
  msisdn?: string
  pan?: string
  name: string
  address: string
  participant_id?: string
  success: boolean
  error?: string
  error_code?: string
  elapsed_ms: number
}

// 202 response from POST /name-lookup/bulk
export interface BulkNameLookupBatchResponse {
  batch_id: string
  total: number
  items: Array<{ msisdn?: string; pan?: string; status: 'pending' }>
}

// GET /name-lookup/bulk/:batchId fallback
export interface BulkNameLookupStatusResponse {
  batch_id: string
  total: number
  completed: number
  results: BulkNameLookupItemResult[]
}

// Socket event payloads
export interface BulkNameLookupResultEvent {
  batch_id: string
  result: BulkNameLookupItemResult
}

export interface BulkNameLookupCompleteEvent {
  batch_id: string
}

// ─── Bulk Fund Transfer ──────────────────────────────────────────────────────

export interface BulkTransferItem {
  amount: number
  sender: { msisdn: string }
  reciever: { msisdn: string; pan?: string }
  participant_id: string
  narration?: string
}

export interface BulkTransferItemResult {
  reference_id: string
  amount: number
  sender: { msisdn: string }
  reciever: { msisdn: string; pan?: string }
  participant_id?: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  transaction?: Record<string, any>
}

export interface BulkTransferResponse {
  batch_id: string
  batch_reference: string
  total_count: number
  success_count: number
  failed_count: number
  status: 'pending' | 'processing' | 'completed'
  results: BulkTransferItemResult[]
}

export interface TransferResults {
  batches: BulkTransferResponse[]
  totalRecipients: number
  totalAmount: number
}
