import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export const VerificationProgress: React.FC = () => {
  const [pct, setPct] = useState(2)

  useEffect(() => {
    const interval = setInterval(() => {
      setPct(prev => {
        if (prev >= 95) return prev
        const remaining = 95 - prev
        const increment = Math.max(0.3, remaining * 0.07)
        return Math.min(95, prev + increment)
      })
    }, 150)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-sm p-8 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2.5">
          <Loader2 size={18} className="animate-spin text-gp-cobalt-600" />
          <span className="font-display font-semibold text-display-xs text-gray-800">
            Verifying accounts…
          </span>
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #373C91 0%, #03AEE9 100%)',
            }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <p className="font-sans text-text-sm text-gray-400">
          Checking account names against the network…
        </p>
      </div>
    </div>
  )
}
