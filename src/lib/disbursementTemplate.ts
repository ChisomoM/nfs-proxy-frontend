import type { DisbursementField } from '@/types/disbursement'

function escapeCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

export function generateTemplateCsv(fields: DisbursementField[]): void {
  const headers  = fields.map(f => escapeCell(f.label))
  const examples = fields.map(f => {
    if (f.example)           return escapeCell(f.example)
    if (f.type === 'phone')  return escapeCell('260971234567')
    if (f.type === 'number') return escapeCell('500')
    return escapeCell('example')
  })

  const csvContent = [headers, examples].map(row => row.join(',')).join('\r\n')

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
