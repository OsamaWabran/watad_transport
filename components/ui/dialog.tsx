import * as React from "react"

import { cn } from "@/lib/utils"

function Dialog({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return null

  return <>{children}</>
}

function DialogContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div
        data-slot="dialog-content"
        className={cn(
          "bg-card text-card-foreground w-full max-w-lg overflow-hidden rounded-3xl border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150",
          className
        )}
        {...props}
      />
    </div>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("border-b border-border bg-muted/50 p-6", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="dialog-title" className={cn("text-base font-bold text-foreground", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex items-center justify-end gap-2 border-t border-border pt-4", className)}
      {...props}
    />
  )
}

export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle }
