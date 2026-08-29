import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-[#dfe6e1] bg-[#f8faf9] px-3.5 py-2 text-base text-[#1a1c1e] shadow-sm transition-[background-color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#707973] focus-visible:border-[#316951] focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#316951]/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#eeeef0] disabled:text-[#707973] disabled:opacity-80 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
