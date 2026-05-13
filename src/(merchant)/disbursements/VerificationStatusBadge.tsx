import React from 'react'
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VerificationStatus } from '@/types/disbursement'

interface VerificationStatusBadgeProps {
  status: VerificationStatus
  className?: string
}

interface BadgeConfig {
  label: string
  icon: React.ReactNode
  className: string
}

const CONFIG: Record<VerificationStatus, BadgeConfig> = {
  'exact-match': {
    label: 'Exact Match',
    icon: <CheckCircle2 size={12} />,
    className: 'bg-success-light text-success-fg',
  },
  'partial-match': {
    label: 'Partial Match',
    icon: <AlertTriangle size={12} />,
    className: 'bg-warning-light text-warning-fg',
  },
  'no-match': {
    label: 'No Match',
    icon: <XCircle size={12} />,
    className: 'bg-danger-light text-danger-fg',
  },
  'lookup-failed': {
    label: 'Lookup Failed',
    icon: <RefreshCw size={12} />,
    className: 'bg-gray-100 text-gray-500',
  },
  pending: {
    label: 'Pending',
    icon: <Clock size={12} />,
    className: 'bg-gp-cobalt-100 text-gp-cobalt-700',
  },
}

export const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
