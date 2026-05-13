import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isUp: boolean;
  };
  featured?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

const variantConfig = {
  default: { iconBg: 'bg-gp-cobalt-100', iconText: 'text-gp-cobalt' },
  success: { iconBg: 'bg-success-light', iconText: 'text-success' },
  warning: { iconBg: 'bg-warning-light', iconText: 'text-warning' },
  info:    { iconBg: 'bg-gp-sky-100',    iconText: 'text-gp-sky-800' },
  danger:  { iconBg: 'bg-danger-light',  iconText: 'text-danger' },
};

/**
 * High-end metric card for financial KPIs.
 * Features spring-based elevation and signature GeePay gradients.
 */
export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  subtitle, 
  icon, 
  trend,
  featured = false,
  variant = 'default',
  className 
}) => {
  const config = variantConfig[variant];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn("h-full", className)}
    >
      <Card className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
        {/* Thin gradient accent bar for featured cards */}
        {featured && (
          <div className="h-0.5 w-full bg-gradient-to-r from-gp-cobalt via-[#2b6fc2] to-gp-sky" />
        )}
        
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="font-sans text-text-sm text-gray-500 font-medium tracking-tight">
            {label}
          </CardTitle>
          {icon && (
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
              config.iconBg
            )}>
              <div className={config.iconText}>{icon}</div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-end">
          <div className="font-display font-bold text-display-xs text-gray-900 tabular-nums">
            {value}
          </div>
          
          {(trend || subtitle) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {trend && (
                <span className={cn(
                  "font-sans text-text-xs font-medium",
                  trend.isUp ? "text-success-fg" : "text-danger-fg"
                )}>
                  {trend.isUp ? '↑' : '↓'} {trend.value}
                </span>
              )}
              {subtitle && (
                <span className="font-sans text-text-xs text-gray-400">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
