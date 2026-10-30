import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border bg-transparent text-foreground",
  success: "bg-positive/10 text-positive",
  warning: "bg-warning/12 text-warning-foreground",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  muted: "bg-muted text-muted-foreground",
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none", badgeVariants[variant] ?? badgeVariants.default, className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
