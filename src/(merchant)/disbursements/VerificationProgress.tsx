import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface VerificationProgressProps {
  progress: { completed: number; total: number }
}

export const VerificationProgress: React.FC<VerificationProgressProps> = ({ progress }) => {
  const { completed, total } = progress
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-6">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <Loader2 size={18} className="animate-spin text-gp-cobalt-600" />
          <span className="font-display font-semibold text-display-xs text-gray-800">
            Verifying accounts…
          </span>
        </div>

        {/* Progress bar track */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #373C91 0%, #03AEE9 100%)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Count label */}
        <p className="font-sans text-text-sm text-gray-400 tabular-nums">
          {completed} / {total} accounts verified
        </p>
      </div>
    </div>
  )
}
