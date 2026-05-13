export interface DisbursementField {
  key: string
  label: string
  type: 'string' | 'number' | 'phone'
  required: boolean
  maxLength?: number
  example?: string
}

export type DisbursementRowData = Record<string, string>

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
  similarity: number   // 0–1
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
  success: boolean
  error?: string
  error_code?: string
  elapsed_ms: number
}

export interface BulkNameLookupResponse {
  results: BulkNameLookupItemResult[]
  elapsed_ms: number
}
