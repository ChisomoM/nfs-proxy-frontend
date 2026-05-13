import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl p-4 font-sans text-text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        // ── Default — neutral info
        default:
          "border border-gray-200 bg-gray-50 text-gray-900 [&>svg]:text-gray-500",
        // ── Destructive — danger
        destructive:
          "border-l-4 border-danger bg-danger-light/40 text-danger-fg [&>svg]:text-danger",
        // ── Success — positive outcome
        success:
          "border-l-4 border-success bg-success-light/40 text-success-fg [&>svg]:text-success",
        // ── Warning — caution
        warning:
          "border-l-4 border-warning bg-warning-light/40 text-warning-fg [&>svg]:text-warning",
        // ── Info — informational
        info:
          "border-l-4 border-info bg-info-light/40 text-info-fg [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), `bg-white ${className}`)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-display font-semibold text-text-sm leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-sans text-text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
