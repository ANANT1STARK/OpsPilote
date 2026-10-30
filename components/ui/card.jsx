import { cn } from "@/lib/utils"

function Card({ className, ...props }) {
  return (
    <section
      data-slot="card"
      className={cn("rounded-xl border border-border/70 bg-card text-card-foreground shadow-[0_1px_3px_rgba(20,24,38,0.04)]", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div data-slot="card-header" className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)} {...props} />
  )
}

function CardTitle({ className, ...props }) {
  return <h2 data-slot="card-title" className={cn("text-sm font-semibold tracking-tight text-foreground", className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p data-slot="card-description" className={cn("text-xs leading-5 text-muted-foreground", className)} {...props} />
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("px-5 pb-5", className)} {...props} />
}

function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex items-center border-t border-border/70 px-5 py-3", className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
