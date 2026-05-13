import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FinancialValue - Component for displaying monetary values
 * CRITICAL: Always uses monospace font as per Geepay Design System
 */
interface FinancialValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number | string;
  currency?: string;
  size?: "sm" | "base" | "lg";
  color?: "default" | "positive" | "negative";
}

export const FinancialValue = React.forwardRef<HTMLSpanElement, FinancialValueProps>(
  ({ amount, currency = "ZMW", size = "base", color = "default", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "text-geepay-sm font-geepay-mono",
      base: "text-geepay-base font-geepay-mono",
      lg: "text-geepay-lg font-geepay-mono",
    };

    const colorClasses = {
      default: "text-foreground",
      positive: "text-geepay-emerald-600", // Money received - green
      negative: "text-geepay-red-600",    // Money sent - red
    };

    const formattedAmount = typeof amount === "number"
      ? amount.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : amount;

    return (
      <span
        ref={ref}
        className={cn(sizeClasses[size], colorClasses[color], className)}
        {...props}
      >
        {currency} {formattedAmount}
      </span>
    );
  }
);
FinancialValue.displayName = "FinancialValue";

/**
 * TransactionRow - Component for displaying transaction information
 * Follows Geepay Design System patterns
 */
interface TransactionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  account: string;
  amount: number;
  type: "credit" | "debit";
  status: "success" | "failed" | "pending";
  timestamp: string;
}

export const TransactionRow = React.forwardRef<HTMLDivElement, TransactionRowProps>(
  ({ id, account, amount, type, status, timestamp, className, ...props }, ref) => {
    const statusColors = {
      success: "text-geepay-emerald-600",
      failed: "text-geepay-red-600",
      pending: "text-yellow-600",
    };

    const amountColor = type === "credit" ? "positive" : "negative";

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between py-3 px-4 border-b border-neutral-grey-200 hover:bg-neutral-grey-50",
          className
        )}
        {...props}
      >
        {/* Left: Account + ID */}
        <div className="flex flex-col">
          <span className="text-geepay-sm font-geepay-primary text-foreground font-medium">
            {account}
          </span>
          <span className="text-geepay-xs font-geepay-mono text-neutral-grey-500">
            ID: {id}
          </span>
        </div>

        {/* Right: Amount + Status */}
        <div className="flex items-center gap-3">
          <span className={cn("text-geepay-xs font-geepay-primary", statusColors[status])}>
            {status}
          </span>
          <FinancialValue
            amount={amount}
            color={amountColor}
            size="base"
          />
        </div>
      </div>
    );
  }
);
TransactionRow.displayName = "TransactionRow";