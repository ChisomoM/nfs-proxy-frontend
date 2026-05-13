import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-col items-center gap-3 py-16 text-center", className)}
    >
      {icon && (
        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display font-semibold text-gray-900">{title}</p>
        {description && (
          <p className="font-sans text-text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="brand"
          size="sm"
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};
