import * as React from "react"

import { cn } from "@/lib/utils"

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#dfe6e1] bg-[#f8faf9] px-3.5 py-2 text-sm text-[#1a1c1e] shadow-sm outline-none transition-[background-color,border-color,box-shadow] focus-visible:border-[#316951] focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#316951]/20 disabled:cursor-not-allowed disabled:bg-[#eeeef0] disabled:text-[#707973] disabled:opacity-80",
        className
      )}
      {...props}
    />
  )
}

export { Select }
