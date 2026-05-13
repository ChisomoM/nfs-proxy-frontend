import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidationSummaryBarProps {
  summary: { total: number; valid: number; invalid: number }
  onReset: () => void
}

export const ValidationSummaryBar: React.FC<ValidationSummaryBarProps> = ({ summary, onReset }) => {
  const { total, valid, invalid } = summary

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-white border border-gray-100 shadow-sm">
      {/* Counts */}
      <div className="flex items-center gap-3 flex-wrap">
        <Pill label={`${total} Rows`} className="bg-gray-100 text-gray-600" />
        <Pill
          label={`${valid} Valid`}
          className="bg-success-light text-success-fg"
          icon={valid > 0 ? <CheckCircle2 size={13} /> : undefined}
        />
        <AnimatePresence>
          {invalid > 0 && (
            <motion.div
              key="invalid-pill"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
            >
              <Pill label={`${invalid} Invalid`} className="bg-danger-light text-danger-fg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning + Reset */}
      <div className="flex items-center gap-4">
        <AnimatePresence>
          {invalid > 0 && (
            <motion.div
              key="warning-msg"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <AlertTriangle size={14} className="text-warning-fg flex-shrink-0" />
              <span className="font-sans text-text-sm text-warning-fg">
                Fix {invalid} error{invalid !== 1 ? 's' : ''} before submitting
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onReset}
          className={cn(
            'flex items-center gap-1.5 font-sans text-text-sm text-gray-500',
            'hover:text-gray-900 transition-colors duration-150',
          )}
        >
          <RotateCcw size={13} />
          Change File
        </button>
      </div>
    </div>
  )
}

interface PillProps {
  label: string
  className?: string
  icon?: React.ReactNode
}

const Pill: React.FC<PillProps> = ({ label, className, icon }) => (
  <span className={cn('flex items-center gap-1 font-sans font-medium text-text-xs px-2.5 py-1 rounded-full', className)}>
    {icon}
    {label}
  </span>
)
