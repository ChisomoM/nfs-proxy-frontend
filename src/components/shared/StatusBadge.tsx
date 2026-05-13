import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'completed' 
  | 'pending' 
  | 'processing' 
  | 'failed' 
  | 'reversed' 
  | 'suspended'
  | 'type-a'
  | 'type-b';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  completed:  { label: 'Completed',  className: 'bg-success-light text-success-fg' },
  pending:    { label: 'Pending',    className: 'bg-warning-light text-warning-fg' },
  processing: { label: 'Processing', className: 'bg-gp-sky-100 text-gp-sky-800' },
  failed:     { label: 'Failed',     className: 'bg-danger-light text-danger-fg' },
  reversed:   { label: 'Reversed',   className: 'bg-gray-100 text-gray-600' },
  suspended:  { label: 'Suspended',  className: 'bg-orange-100 text-orange-700' },
  'type-a':   { label: 'Type A',     className: 'bg-gp-cobalt-100 text-gp-cobalt-700' },
  'type-b':   { label: 'Type B',     className: 'bg-gp-sky-100 text-gp-sky-700' },
};

/**
 * Standard status badge for the GeePay platform.
 * Uses semantic and brand tokens from the design system.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full font-sans text-text-xs font-medium transition-colors",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
