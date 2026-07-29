import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        blue: "border-blue-200/60 bg-blue-50 text-blue-700",
        indigo: "border-indigo-200/60 bg-indigo-50 text-indigo-700",
        emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
        amber: "border-amber-200 bg-amber-50 text-amber-700",
        rose: "border-rose-200/60 bg-rose-50 text-rose-700",
        purple: "border-purple-200 bg-purple-50 text-purple-700",
        destructive: "border-red-200 bg-red-50 text-red-700",
      },
      shape: {
        default: "rounded-lg",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
    },
  }
)

function Badge({
  className,
  variant,
  shape,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, shape }), className)} {...props} />
}

export { Badge, badgeVariants }
