import type { DisbursementField, DisbursementRow, DisbursementRowData } from '@/types/disbursement'

export const DEFAULT_SCHEMA: DisbursementField[] = [
  { key: 'name',      label: 'Recipient Name',  type: 'string', required: true,  example: 'John Banda'      },
  { key: 'phone',     label: 'Phone Number',     type: 'phone',  required: true,  example: '260971234567'    },
  { key: 'amount',    label: 'Amount (ZMW)',     type: 'number', required: true,  example: '500'             },
  { key: 'reference', label: 'Reference',        type: 'string', required: false, maxLength: 50, example: 'Salary - April 2026' },
]

export function validateField(value: string, field: DisbursementField): string | null {
  const trimmed = value.trim()

  if (field.required && trimmed === '') {
    return `${field.label} is required`
  }

  if (trimmed === '') return null

  if (field.maxLength && trimmed.length > field.maxLength) {
    return `${field.label} must not exceed ${field.maxLength} characters`
  }

  if (field.type === 'phone') {
    const digits = trimmed.replace(/\s+/g, '')
    if (!/^(\+260|260|0)[0-9]{9}$/.test(digits)) {
      return 'Enter a valid phone number (e.g. 260971234567)'
    }
  }

  if (field.type === 'number') {
    const num = Number(trimmed)
    if (isNaN(num)) return `${field.label} must be a valid number`
    if (num <= 0)    return `${field.label} must be greater than 0`
  }

  return null
}

export function validateRow(
  data: DisbursementRowData,
  fields: DisbursementField[],
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const msg = validateField(data[field.key] ?? '', field)
    if (msg) errors[field.key] = msg
  }
  return errors
}

export function validateAllRows(
  rows: DisbursementRow[],
  fields: DisbursementField[],
): DisbursementRow[] {
  return rows.map(row => ({ ...row, errors: validateRow(row.data, fields) }))
}

export function computeSummary(rows: DisbursementRow[]): {
  total: number
  valid: number
  invalid: number
} {
  const invalid = rows.filter(r => Object.keys(r.errors).length > 0).length
  return { total: rows.length, valid: rows.length - invalid, invalid }
}
