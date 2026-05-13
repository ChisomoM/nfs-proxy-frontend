import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { File, Download, Save, X, Loader2, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { PageTransition } from '@/components/shared/PageTransition'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { TemplateFormBuilder } from '@/components/admin/TemplateFormBuilder'
import { useAdminTemplate } from '@/hooks/useAdminTemplate'

export const AdminSettings: React.FC = () => {
  const {
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
  } = useAdminTemplate()

  const [hasChanges, setHasChanges] = useState(false)

  const handleFieldUpdate = (index: number, updates: any) => {
    updateField(index, updates)
    setHasChanges(true)
  }

  const handleAddField = () => {
    addField()
    setHasChanges(true)
  }

  const handleRemoveField = (index: number) => {
    removeField(index)
    setHasChanges(true)
  }

  const handleSave = async () => {
    await saveTemplate()
    setHasChanges(false)
  }

  const handleCancel = () => {
    resetFields()
    setHasChanges(false)
  }

  const handleDownloadTemplate = () => {
    if (fields.length === 0) return

    const headers = fields.map(f => `"${f.label.replace(/"/g, '""')}"`)
    const examples = fields.map(f => `"${(f.example || '').replace(/"/g, '""')}"`)

    const csvContent = [headers, examples].map(row => row.join(',')).join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'disbursement_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <PageTransition className="space-y-8">
        <PageHeader
          title="Settings"
          subtitle="Configure platform-wide settings for GeePay NFS."
        />
        <SectionCard title="Bulk Disbursement Template" className="max-w-4xl" onGrayBg>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        </SectionCard>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Configure platform-wide settings for GeePay NFS."
      />

      <SectionCard title="Bulk Disbursement Template" className="max-w-4xl" onGrayBg>
        <div className="space-y-6">
          {/* Status & Info */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
            <div className="flex items-center gap-3">
              <File size={18} className="text-gp-cobalt" />
              <div className="flex-1">
                <p className="font-sans font-medium text-gray-900">Active Template</p>
                <p className="text-text-sm text-gray-500">
                  {fields.length} field{fields.length !== 1 ? 's' : ''}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium text-text-sm hover:bg-gray-50 transition-colors"
              >
                <Download size={14} />
                Download CSV
              </motion.button>
            </div>

            {/* Last Updated Info */}
            {lastUpdated && (
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 text-text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  Last updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                </div>
                {lastUpdatedBy && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={14} className="text-gray-400" />
                    by {lastUpdatedBy}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Builder */}
          <div>
            <h3 className="font-sans font-medium text-gray-900 mb-4">Edit Template Fields</h3>
            <TemplateFormBuilder
              fields={fields}
              onAddField={handleAddField}
              onRemoveField={handleRemoveField}
              onUpdateField={handleFieldUpdate}
              isEditing={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <motion.button
              whileHover={isSaving ? {} : { scale: 1.02 }}
              whileTap={isSaving ? {} : { scale: 0.98 }}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gp-cobalt to-gp-sky text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Template
                </>
              )}
            </motion.button>

            {hasChanges && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </motion.button>
            )}
          </div>

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-text-sm text-amber-800"
            >
              You have unsaved changes. Remember to save your template before leaving this page.
            </motion.div>
          )}
        </div>
      </SectionCard>
    </PageTransition>
  )
}
