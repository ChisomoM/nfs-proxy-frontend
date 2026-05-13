import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base — GeePay: rounded-md pill, font-sans text-text-xs, no border by default
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gp-cobalt focus:ring-offset-2",
  {
    variants: {
      variant: {
        // ── Cobalt — platform identity badge
        default:
          "bg-gp-cobalt/10 text-gp-cobalt",
        // ── Sky tint — secondary / informational
        secondary:
          "bg-gp-sky/10 text-gp-sky-700",
        // ── Danger semantic
        destructive:
          "bg-danger-light text-danger-fg",
        // ── Outline — minimal
        outline:
          "border border-gray-200 text-gray-700",
        // ── Semantic success
        success:
          "bg-success-light text-success-fg",
        // ── Semantic warning
        warning:
          "bg-warning-light text-warning-fg",
        // ── Semantic info
        info:
          "bg-info-light text-info-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
