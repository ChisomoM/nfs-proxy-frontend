import type { DisbursementField } from '@/types/disbursement'
import { getAuthHeader } from '@/lib/api/auth'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8020'

export interface AdminTemplateResponse {
  id: string
  fields: DisbursementField[]
  updated_at: string
  updated_by?: string
}

interface ApiEnvelope {
  code: number
  status: number
  message: string
  data: unknown
}

export const AdminDisbursementService = {
  async getTemplate(): Promise<AdminTemplateResponse> {
    const headers = {
      ...getAuthHeader(),
    }

    console.log('Fetching template with headers:', { Authorization: headers.Authorization ? 'Bearer ***' : 'missing' })

    const response = await fetch(`${BACKEND_URL}api/v1/admin/disbursements/template`, {
      method: 'GET',
      headers,
    })

    console.log('Template response status:', response.status)

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        console.error('Template error:', errorData)
        throw new Error(errorData.error || 'Failed to fetch template')
      } else {
        const text = await response.text()
        console.error('Template response (non-JSON):', text)
        throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`)
      }
    }

    const envelope = await response.json() as ApiEnvelope
    return envelope.data as AdminTemplateResponse
  },

  async saveTemplate(fields: DisbursementField[]): Promise<AdminTemplateResponse> {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    }

    const response = await fetch(`${BACKEND_URL}api/v1/admin/disbursements/template`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save template')
      } else {
        const text = await response.text()
        throw new Error(`Failed to save template: ${response.status} ${response.statusText}`)
      }
    }

    const envelope = await response.json() as ApiEnvelope
    return envelope.data as AdminTemplateResponse
  },
}
