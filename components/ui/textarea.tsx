import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-28 w-full resize-y rounded-xl border border-[#dfe6e1] bg-[#f8faf9] px-3.5 py-3 text-sm text-[#1a1c1e] shadow-sm outline-none transition-[background-color,border-color,box-shadow] placeholder:text-[#707973] focus-visible:border-[#316951] focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#316951]/20 disabled:cursor-not-allowed disabled:bg-[#eeeef0] disabled:text-[#707973] disabled:opacity-80 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
