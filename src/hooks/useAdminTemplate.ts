import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { DisbursementField } from '@/types/disbursement'
import { AdminDisbursementService } from '@/lib/api/admin-disbursement'

const DEFAULT_FIELD_TYPES = ['string', 'number', 'phone'] as const

// Helper to generate slug from label
function labelToKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50)
}

export function useAdminTemplate() {
  const [fields, setFields] = useState<DisbursementField[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null)

  // Load template on mount
  useEffect(() => {
    loadTemplate()
  }, [])

  const loadTemplate = async () => {
    try {
      setIsLoading(true)
      console.log('[Admin Template] Loading template...')
      const data = await AdminDisbursementService.getTemplate()
      console.log('[Admin Template] Template loaded successfully:', data)
      setFields(data.fields)
      setLastUpdated(data.updated_at)
      setLastUpdatedBy(data.updated_by || null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Admin Template] Failed to load template:', errorMsg)
      toast.error(`Failed to load template: ${errorMsg}`)
    } finally {
      setIsLoading(false)
    }
  }

  const addField = () => {
    const newField: DisbursementField = {
      key: `field_${Date.now()}`,
      label: 'New Field',
      type: 'string',
      required: false,
      example: '',
    }
    setFields([...fields, newField])
  }

  const removeField = (index: number) => {
    if (fields.length <= 1) {
      toast.error('Template must have at least one field')
      return
    }
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<DisbursementField>) => {
    const updated = [...fields]
    const newField = { ...updated[index], ...updates }

    // Auto-generate key when label changes
    if (updates.label && updates.label !== updated[index].label) {
      newField.key = labelToKey(updates.label)
    }

    updated[index] = newField
    setFields(updated)
  }

  const saveTemplate = async () => {
    try {
      // Validate fields
      if (fields.length === 0) {
        toast.error('Template must have at least one field')
        return
      }

      for (const field of fields) {
        if (!field.key || !field.label) {
          toast.error('All fields must have a label')
          return
        }
      }

      setIsSaving(true)
      const response = await AdminDisbursementService.saveTemplate(fields)
      setLastUpdated(response.updated_at)
      setLastUpdatedBy(response.updated_by || null)
      toast.success('Template saved successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template')
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const resetFields = () => {
    loadTemplate()
  }

  return {
    fields,
    isLoading,
    isSaving,
    lastUpdated,
    lastUpdatedBy,
    addField,
    removeField,
    updateField,
    saveTemplate,
    resetFields,
  }
}
