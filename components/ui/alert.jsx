import { cn } from "@/lib/utils"

function Alert({ className, variant = "default", ...props }) {
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      data-slot="alert"
      className={cn(
        "relative flex w-full gap-3 rounded-xl border p-4 text-sm",
        variant === "destructive" ? "border-destructive/20 bg-destructive/[0.045] text-foreground" : "border-border bg-muted/40 text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }) {
  return <h3 data-slot="alert-title" className={cn("text-xs font-semibold leading-5", className)} {...props} />
}

function AlertDescription({ className, ...props }) {
  return <div data-slot="alert-description" className={cn("text-xs leading-5 text-muted-foreground [&_p]:leading-5", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
