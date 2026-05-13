import React from 'react';
import { cn } from '@/lib/utils';

interface ActionIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'neutral' | 'danger' | 'brand';
}

const variantClass = {
  neutral: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  danger: 'text-gray-400 hover:text-danger-fg hover:bg-danger-light',
  brand: 'text-gp-cobalt hover:text-gp-sky hover:bg-gp-sky-100/60',
};

export const ActionIconButton = React.forwardRef<HTMLButtonElement, ActionIconButtonProps>(
  ({ icon, label, variant = 'neutral', className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gp-cobalt focus-visible:ring-offset-2',
        variantClass[variant],
        className,
      )}
      {...props}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 16 })
        : icon}
    </button>
  ),
);

ActionIconButton.displayName = 'ActionIconButton';
