import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function FormBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-body"
      className={cn("space-y-5 p-6", className)}
      {...props}
    />
  )
}

function FormGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-grid"
      className={cn("grid grid-cols-1 gap-5 sm:grid-cols-2", className)}
      {...props}
    />
  )
}

function FormField({
  className,
  label,
  htmlFor,
  required,
  hint,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  label?: React.ReactNode
  htmlFor?: string
  required?: boolean
  hint?: React.ReactNode
}) {
  return (
    <div data-slot="form-field" className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor} className="text-xs font-bold text-[#404943]">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      {children}
      {hint && <p className="text-xs leading-relaxed text-[#707973]">{hint}</p>}
    </div>
  )
}

function FormSection({
  className,
  title,
  description,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <section
      data-slot="form-section"
      className={cn("rounded-2xl border border-transparent bg-white p-6 shadow-enterprise", className)}
      {...props}
    >
      {(title || description) && (
        <div className="mb-5 border-b border-[#eeeef0] pb-4">
          {title && <h2 className="text-base font-extrabold text-[#1a1c1e]">{title}</h2>}
          {description && <p className="mt-1 text-xs leading-relaxed text-[#707973]">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

function CheckboxField({
  className,
  label,
  hint,
  children,
  ...props
}: React.ComponentProps<"label"> & {
  label: React.ReactNode
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label
      data-slot="checkbox-field"
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe6e1] bg-[#f8faf9] p-3.5 text-sm text-[#1a1c1e] transition hover:bg-white",
        className
      )}
      {...props}
    >
      <span className="mt-0.5">{children}</span>
      <span className="min-w-0">
        <span className="block font-bold text-[#404943]">{label}</span>
        {hint && <span className="mt-1 block text-xs leading-relaxed text-[#707973]">{hint}</span>}
      </span>
    </label>
  )
}

export { CheckboxField, FormBody, FormField, FormGrid, FormSection }
