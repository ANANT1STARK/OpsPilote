"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header className={cn("mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}
        <h1 className="text-[26px] font-semibold tracking-[-0.035em] text-foreground sm:text-[30px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}

function SectionHeading({ title, description, action, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

function MetricTile({ label, value, change, detail, icon: Icon, tone = "violet", className }) {
  const iconTone = {
    violet: "bg-primary/8 text-primary",
    positive: "bg-positive/10 text-positive",
    warning: "bg-warning/12 text-warning-foreground",
    info: "bg-info/10 text-info",
    danger: "bg-destructive/10 text-destructive",
  }

  return (
    <article className={cn("rounded-xl border border-border/70 bg-card p-4 shadow-[0_1px_3px_rgba(20,24,38,0.04)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", iconTone[tone])}><Icon aria-hidden="true" className="size-4" /></span>}
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-foreground">{value}</p>
      {(change || detail) && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          {change && <span className={cn("font-semibold", tone === "positive" ? "text-positive" : tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning-foreground" : "text-primary")}>{change}</span>}
          {detail && <span className="truncate text-muted-foreground">{detail}</span>}
        </div>
      )}
    </article>
  )
}

function ProgressMeter({ label, value, meta, tone = "primary", className }) {
  const fillTone = {
    primary: "bg-primary",
    positive: "bg-positive",
    warning: "bg-warning",
    danger: "bg-destructive",
    info: "bg-info",
  }

  return (
    <div className={cn("w-full", className)}>
      {(label || meta) && <div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="font-medium text-foreground">{label}</span><span className="shrink-0 text-muted-foreground">{meta ?? `${value}%`}</span></div>}
      <div role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-[width] duration-500", fillTone[tone] ?? fillTone.primary)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

function ChartTooltip({ active, payload, label, suffix = "" }) {
  if (!active || !payload?.length) return null

  return (
    <div className="min-w-[132px] rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.filter((entry) => entry.value !== null && entry.value !== undefined).map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="size-1.5 rounded-full" style={{ backgroundColor: entry.color ?? entry.stroke }} />{entry.name}</span>
            <span className="font-semibold tabular-nums text-foreground">{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}{suffix}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ title, description, icon: Icon = AlertTriangle, action }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
      <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><Icon aria-hidden="true" className="size-5" /></span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function ConfirmationDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", destructive = false }) {
  const confirmRef = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement
    confirmRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
      if (event.key === "Tab") {
        event.preventDefault()
        if (document.activeElement === confirmRef.current) cancelRef.current?.focus()
        else confirmRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" />
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description" className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <span className={cn("mb-4 flex size-10 items-center justify-center rounded-xl", destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
          {destructive ? <AlertTriangle aria-hidden="true" className="size-5" /> : <Check aria-hidden="true" className="size-5" />}
        </span>
        <h2 id="confirmation-title" className="text-base font-semibold text-foreground">{title}</h2>
        <p id="confirmation-description" className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button ref={cancelRef} type="button" variant="outline" onClick={onClose}><X data-icon="inline-start" aria-hidden="true" />Cancel</Button>
          <Button ref={confirmRef} type="button" variant={destructive ? "destructive" : "default"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </section>
    </div>
  )
}

function StatusBadge({ status, className }) {
  const variantByStatus = {
    healthy: "success",
    active: "success",
    ontrack: "success",
    "on track": "success",
    approved: "success",
    "pending review": "warning",
    warning: "warning",
    delayed: "warning",
    "at risk": "danger",
    breached: "danger",
    escalated: "danger",
    degraded: "danger",
    forecast: "info",
    resolved: "muted",
    dismissed: "muted",
  }
  const key = String(status).toLowerCase()
  return <Badge variant={variantByStatus[key] ?? "muted"} className={className}>{status}</Badge>
}

function InlineLink({ href, children, className, ...props }) {
  return <a href={href} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary", className)} {...props}>{children}</a>
}

export { PageHeader, SectionHeading, MetricTile, ProgressMeter, ChartTooltip, EmptyState, ConfirmationDialog, StatusBadge, InlineLink }
