import React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  action?: React.ReactNode;
  featured?: boolean;
  onGrayBg?: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  action,
  featured = false,
  onGrayBg = false,
  children,
  className,
  contentClassName,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl overflow-hidden border border-gray-100",
        !onGrayBg && "shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      {featured && (
        <div className="h-0.5 w-full bg-gradient-to-r from-gp-cobalt via-[#2b6fc2] to-gp-sky" />
      )}
      {(title || action) && (
        <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <h2 className="font-display font-semibold text-text-lg text-gray-900 tracking-tight">
              {title}
            </h2>
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-6", contentClassName)}>{children}</div>
    </div>
  );
};
