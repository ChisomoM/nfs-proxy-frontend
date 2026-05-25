import type { DisbursementField } from '@/types/disbursement'
import { generateFieldDescription } from '@/lib/validations/disbursement'

function escapeCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function generateTemplateCsv(fields: DisbursementField[]): void {
  const headers  = fields.map(f => escapeCell(f.label))

  // CSV rows: headers only (no descriptions or examples)
  const csvContent = headers.join(',')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = 'disbursement_template.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
