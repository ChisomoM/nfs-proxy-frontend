import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display font-bold text-display-sm text-gradient-brand tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-text-sm text-gray-500 mt-1.5 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
