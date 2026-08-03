"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center justify-center cursor-pointer select-none">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded border border-slate-300 bg-white transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-slate-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:bg-slate-900 peer-checked:border-slate-900 peer-checked:text-white dark:border-slate-700 dark:bg-slate-900 dark:peer-checked:bg-slate-50 dark:peer-checked:text-slate-900 flex items-center justify-center",
            className
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
