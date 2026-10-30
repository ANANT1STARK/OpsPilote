import { cn } from "@/lib/utils"

function FieldGroup({ className, ...props }) {
  return <div data-slot="field-group" className={cn("flex flex-col gap-4", className)} {...props} />
}

function Field({ className, orientation = "vertical", ...props }) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      className={cn("flex flex-col gap-2", orientation === "horizontal" && "flex-row items-center justify-between", className)}
      {...props}
    />
  )
}

function FieldSet({ className, ...props }) {
  return <fieldset data-slot="field-set" className={cn("flex min-w-0 flex-col gap-4", className)} {...props} />
}

function FieldLegend({ className, ...props }) {
  return <legend data-slot="field-legend" className={cn("mb-1 text-sm font-semibold text-foreground", className)} {...props} />
}

function FieldLabel({ className, ...props }) {
  return <label data-slot="field-label" className={cn("text-sm font-medium text-foreground", className)} {...props} />
}

function FieldDescription({ className, ...props }) {
  return <p data-slot="field-description" className={cn("text-xs leading-5 text-muted-foreground", className)} {...props} />
}

function FieldError({ className, children, ...props }) {
  if (!children) return null
  return <p data-slot="field-error" role="alert" className={cn("text-xs font-medium text-destructive", className)} {...props}>{children}</p>
}

export { FieldGroup, Field, FieldSet, FieldLegend, FieldLabel, FieldDescription, FieldError }
