import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Eye, ChevronDown } from 'lucide-react'
import type { DisbursementField } from '@/types/disbursement'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TemplateFormBuilderProps {
  fields: DisbursementField[]
  onAddField: () => void
  onRemoveField: (index: number) => void
  onUpdateField: (index: number, updates: Partial<DisbursementField>) => void
  isEditing?: boolean
}

export const TemplateFormBuilder: React.FC<TemplateFormBuilderProps> = ({
  fields,
  onAddField,
  onRemoveField,
  onUpdateField,
  isEditing = true,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const fieldTypes = ['string', 'number', 'phone']

  return (
    <div className="space-y-4">
      {/* Fields List */}
      <AnimatePresence mode="popLayout">
        {fields.map((field, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            {/* Field Header */}
            <div
              className={cn(
                'p-4 flex items-center justify-between',
                expandedIndex === index ? 'bg-gray-50 border-b border-gray-200' : 'hover:bg-gray-50',
                isEditing ? 'cursor-pointer' : ''
              )}
              onClick={() => isEditing && setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-sans font-medium text-gray-900 truncate">{field.label}</h4>
                    <p className="text-text-xs text-gray-500 truncate">
                      {field.type === 'string' ? 'Text' : field.type === 'number' ? 'Number' : 'Phone'}
                      {field.required && ' • Required'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {isEditing && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveField(index)
                      }}
                      className="p-2 hover:bg-red-50 text-red-500 rounded transition-colors"
                      title="Remove field"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                    <motion.div
                      animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-2 text-gray-400"
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </>
                )}
              </div>
            </div>

            {/* Field Details */}
            <AnimatePresence>
              {expandedIndex === index && isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 bg-white p-4 space-y-4"
                >
                  {/* Label */}
                  <div>
                    <label className="block text-text-sm font-medium text-gray-700 mb-1">
                      Field Label (displayed to users)
                    </label>
                    <Input
                      value={field.label}
                      onChange={(e) => onUpdateField(index, { label: e.target.value })}
                      placeholder="e.g. Recipient Name"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-text-sm font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => onUpdateField(index, { type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-text-sm focus:outline-none focus:ring-2 focus:ring-gp-cobalt"
                    >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === 'string' ? 'Text' : type === 'number' ? 'Number' : 'Phone'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Required */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => onUpdateField(index, { required: e.target.checked })}
                      className="w-4 h-4 text-gp-cobalt border-gray-300 rounded cursor-pointer"
                      id={`required-${index}`}
                    />
                    <label htmlFor={`required-${index}`} className="text-text-sm text-gray-700 cursor-pointer">
                      Required field
                    </label>
                  </div>

                  {/* Max Length (for strings) */}
                  {field.type === 'string' && (
                    <div>
                      <label className="block text-text-sm font-medium text-gray-700 mb-1">
                        Max Length (optional)
                      </label>
                      <Input
                        type="number"
                        value={field.maxLength ?? ''}
                        onChange={(e) =>
                          onUpdateField(index, { maxLength: e.target.value ? parseInt(e.target.value) : undefined })
                        }
                        placeholder="e.g. 50"
                      />
                    </div>
                  )}

                  {/* Example */}
                  <div>
                    <label className="block text-text-sm font-medium text-gray-700 mb-1">
                      Example Value
                    </label>
                    <Input
                      value={field.example || ''}
                      onChange={(e) => onUpdateField(index, { example: e.target.value })}
                      placeholder="e.g. John Banda"
                    />
                    <p className="text-text-xs text-gray-500 mt-1">
                      Helps merchants understand what kind of data to enter
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Field Button */}
      {isEditing && (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onAddField}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gp-cobalt hover:bg-gp-cobalt/5 transition-colors text-gray-600 hover:text-gp-cobalt font-medium flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Field
        </motion.button>
      )}

      {/* Preview Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-sans font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Eye size={16} />
          Template Preview (CSV Download)
        </h4>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
          <table className="text-text-xs w-full">
            <thead>
              <tr>
                {fields.map((field) => (
                  <th
                    key={field.key}
                    className="px-2 py-1 text-left font-medium text-gray-600 border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {fields.map((field) => (
                  <td key={field.key} className="px-2 py-1 text-gray-500 border-r border-gray-200 last:border-r-0 whitespace-nowrap">
                    {field.example || '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-text-xs text-gray-500 mt-2">
          Merchants will download this template structure and fill in their data
        </p>
      </div>
    </div>
  )
}
