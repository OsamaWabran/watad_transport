import * as React from "react"

import { cn } from "@/lib/utils"

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-10 w-full rounded-xl border px-3 py-2 text-sm outline-none transition-[color,box-shadow,border-color] focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Select }
