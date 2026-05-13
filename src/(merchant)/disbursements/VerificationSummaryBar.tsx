import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/types/disbursement'
import type { VerificationSummary } from '@/hooks/useNameVerification'

interface VerificationSummaryBarProps {
  summary: VerificationSummary
  filter: VerificationStatus | 'all'
  selected: Set<string>
  onFilterChange: (value: VerificationStatus | 'all') => void
  onRetryFailed: () => void
  onRemoveSelected: () => void
  isRetrying: boolean
}

interface PillProps {
  label: string
  className: string
  icon?: React.ReactNode
}

const Pill: React.FC<PillProps> = ({ label, className, icon }) => (
  <span
    className={cn(
      'flex items-center gap-1 font-sans font-medium text-text-xs px-2.5 py-1 rounded-full',
      className,
    )}
  >
    {icon}
    {label}
  </span>
)

const pillVariants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.85 },
}

export const VerificationSummaryBar: React.FC<VerificationSummaryBarProps> = ({
  summary,
  filter,
  selected,
  onFilterChange,
  onRetryFailed,
  onRemoveSelected,
  isRetrying,
}) => {
  const { total, exactMatch, partialMatch, noMatch, failed } = summary

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-white border border-gray-100 shadow-sm flex-wrap">
      {/* Left — summary pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Pill label={`${total} Total`} className="bg-gray-100 text-gray-600" />

        <AnimatePresence>
          {exactMatch > 0 && (
            <motion.div key="exact" {...pillVariants} transition={{ duration: 0.15 }}>
              <Pill
                label={`${exactMatch} Exact Match`}
                className="bg-success-light text-success-fg"
                icon={<CheckCircle2 size={12} />}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {partialMatch > 0 && (
            <motion.div key="partial" {...pillVariants} transition={{ duration: 0.15 }}>
              <Pill
                label={`${partialMatch} Partial Match`}
                className="bg-warning-light text-warning-fg"
                icon={<AlertTriangle size={12} />}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {noMatch > 0 && (
            <motion.div key="nomatch" {...pillVariants} transition={{ duration: 0.15 }}>
              <Pill
                label={`${noMatch} No Match`}
                className="bg-danger-light text-danger-fg"
                icon={<XCircle size={12} />}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {failed > 0 && (
            <motion.div key="failed" {...pillVariants} transition={{ duration: 0.15 }}>
              <Pill
                label={`${failed} Failed`}
                className="bg-gray-100 text-gray-500"
                icon={<RefreshCw size={12} />}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Filter select */}
        <Select value={filter} onValueChange={v => onFilterChange(v as VerificationStatus | 'all')}>
          <SelectTrigger className="h-8 w-[160px] text-text-xs font-sans rounded-lg bg-gray-50 border-gray-200">
            <SelectValue placeholder="Filter…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="exact-match">Exact Match</SelectItem>
            <SelectItem value="partial-match">Partial Match</SelectItem>
            <SelectItem value="no-match">No Match</SelectItem>
            <SelectItem value="lookup-failed">Lookup Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Retry Failed */}
        <AnimatePresence>
          {failed > 0 && (
            <motion.div
              key="retry-btn"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
            >
              <motion.button
                whileHover={isRetrying ? {} : { scale: 1.02 }}
                whileTap={isRetrying ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={onRetryFailed}
                disabled={isRetrying}
                className="flex items-center gap-1.5 font-sans text-text-sm font-medium text-gp-cobalt-700 bg-gp-cobalt-100 hover:bg-gp-cobalt-200 px-3 py-1.5 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                Retry Failed
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remove Selected */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              key="remove-btn"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={onRemoveSelected}
                className="flex items-center gap-1.5 font-sans text-text-sm font-medium text-danger-fg bg-danger-light hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors duration-150"
              >
                <Trash2 size={13} />
                Remove {selected.size} Selected
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
