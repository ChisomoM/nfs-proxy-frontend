import React from 'react';
import { cn } from '@/lib/utils';

interface MerchantToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const MerchantToolbar: React.FC<MerchantToolbarProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {children}
    </div>
  );
};
