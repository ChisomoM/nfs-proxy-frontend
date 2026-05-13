import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type IconVariant = 'cobalt' | 'sky' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconVariant?: IconVariant;
  className?: string;
}

const iconVariantConfig: Record<IconVariant, { bg: string; text: string }> = {
  cobalt:  { bg: 'bg-gp-cobalt-100', text: 'text-gp-cobalt' },
  sky:     { bg: 'bg-gp-sky-100',    text: 'text-gp-sky-800' },
  success: { bg: 'bg-success-light', text: 'text-success-fg' },
  warning: { bg: 'bg-warning-light', text: 'text-warning-fg' },
  danger:  { bg: 'bg-danger-light',  text: 'text-danger-fg' },
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  iconVariant = 'cobalt',
  className,
}) => {
  const config = iconVariantConfig[iconVariant];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn("h-full", className)}
    >
      <div className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gp-cobalt/20 hover:shadow-sm transition-all duration-200 flex items-center gap-3.5 h-full">
        <div className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0",
          config.bg,
          config.text
        )}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 })
            : icon}
        </div>
        <div className="min-w-0">
          <p className="font-sans text-text-xs font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1.5 truncate">
            {label}
          </p>
          <p className="font-display text-text-xl font-bold text-gradient-stat tabular-nums truncate">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
