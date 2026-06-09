import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  hasBack?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action,hasBack , className }) => {
  const navigate = useNavigate();
  return (
    
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8",
        className
      )}
    >
      <div className="flex flex-row gap-4">{hasBack && (
        <button
        onClick={() => navigate(-1)}
                    className="h-10 rounded-xl border border-gray-200 bg-white px-4 font-sans text-text-sm font-semibold text-gray-700 inline-flex items-center gap-2  hover:bg-white hover:shadow-sm"

        >
          <ArrowLeft size={15} />
            <p>Back</p>
          
        </button>
      )}<div className="min-w-0">
        <h1 className="font-display font-bold text-display-sm text-gradient-brand tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-text-sm text-gray-500 mt-1.5 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div></div>
      
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};
