"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Download,
  RefreshCw,
  ShieldAlert,
  Ticket,
  Users,
  UserRoundX,
  CheckCircle2,
  Layers3,
  CalendarClock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip, PageHeader } from "@/components/dashboard/section-shared"
import { useDashboard } from "@/components/dashboard/dashboard-shell"
import { apiGet } from "@/lib/api"
import { cn } from "@/lib/utils"

const PERIOD_LABELS = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
}

function number(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—"
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function percent(value) {
  return value === null || value === undefined ? "—" : `${number(value, 1)}%`
}

function formatMinutes(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—"
  const minutes = Number(value)
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = minutes / 60
  if (hours < 24) return `${number(hours, 1)} hr`
  const days = hours / 24
  return `${number(days, 1)} days`
}

function formatAgeHours(value) {
  if (value === null || value === undefined) return "—"
  const hours = Number(value)
  if (hours < 24) return `${number(hours, 1)}h`
  return `${number(hours / 24, 1)} days`
}

function formatDayLabel(value, timezone = "Asia/Kolkata") {
  if (!value) return "—"
  const parts = String(value).split("-").map(Number)
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return String(value)
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12))
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: timezone }).format(date)
}

function formatDate(value, timezone = "Asia/Kolkata") {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: timezone,
  }).format(date)
}

function formatDateTime(value, timezone = "Asia/Kolkata") {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date)
}

function comparisonText(comparison, type = "percent") {
  if (!comparison) return "No previous-period baseline"
  if (type === "points") {
    const value = comparison.change_percentage_points
    if (value === null || value === undefined) return "No previous-period baseline"
    const prefix = value > 0 ? "+" : ""
    return `${prefix}${number(value, 2)} pp vs prior period`
  }
  const value = comparison.percent_change
  if (value === null || value === undefined) return "No previous-period baseline"
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${number(value, 1)}% vs prior period`
}

function changeTone(comparison, inverse = false, points = false) {
  const value = points
    ? comparison?.change_percentage_points
    : comparison?.percent_change
  if (value === null || value === undefined || value === 0) return "neutral"
  const favorable = inverse ? value < 0 : value > 0
  return favorable ? "good" : "bad"
}

function Delta({ text, tone = "neutral" }) {
  const className = tone === "good"
    ? "text-positive"
    : tone === "bad"
      ? "text-destructive"
      : "text-muted-foreground"
  const Icon = tone === "good" ? ArrowDownRight : tone === "bad" ? ArrowUpRight : null
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1 text-[10px] font-medium", className)}>
      {Icon && <Icon aria-hidden="true" className="size-3.5 shrink-0" />}
      <span className="truncate">{text}</span>
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, detail, tone = "violet", comparison, inverse = false, points = false, neutralDelta = false }) {
  const iconTone = {
    violet: "bg-primary/10 text-primary",
    positive: "bg-positive/10 text-positive",
    warning: "bg-warning/12 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/10 text-info",
  }
  const delta = comparisonText(comparison, points ? "points" : "percent")
  return (
    <Card className="min-h-[142px] transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", iconTone[tone])}>
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-foreground tabular-nums">{value}</p>
        <div className="mt-1.5 flex min-h-4 flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <Delta text={delta} tone={neutralDelta ? "neutral" : changeTone(comparison, inverse, points)} />
          {detail && <span className="text-[10px] text-muted-foreground">{detail}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function SectionEyebrow({ children }) {
  return <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{children}</p>
}

function ChartEmpty({ message = "No trend data available for this period." }) {
  return <div className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-border/70 text-xs text-muted-foreground">{message}</div>
}

function VolumeChart({ data }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-3">
        <div>
          <CardTitle>Ticket volume</CardTitle>
          <CardDescription className="mt-1">Tickets created compared with tickets resolved each day</CardDescription>
        </div>
        <Badge variant="muted">Daily</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Incoming</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" />Resolved</span>
        </div>
        {data?.length ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="overviewIncomingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="overviewResolvedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--info)" stopOpacity={0.16} /><stop offset="100%" stopColor="var(--info)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 4" />
                <XAxis dataKey="day_label" axisLine={false} tickLine={false} tickMargin={10} interval={Math.max(0, Math.floor(data.length / 7) - 1)} />
                <YAxis axisLine={false} tickLine={false} tickMargin={8} width={34} allowDecimals={false} />
                <Tooltip content={<ChartTooltip suffix=" tickets" />} />
                <Area type="monotone" dataKey="incoming" name="Incoming" stroke="var(--primary)" strokeWidth={2} fill="url(#overviewIncomingFill)" activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="var(--info)" strokeWidth={2} fill="url(#overviewResolvedFill)" activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <ChartEmpty />}
      </CardContent>
    </Card>
  )
}

function SlaTrendChart({ data }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-3">
        <div>
          <CardTitle>Daily SLA breaches</CardTitle>
          <CardDescription className="mt-1">Historical breach events by SLA target type</CardDescription>
        </div>
        <Badge variant="danger">Count</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-destructive" />First response</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" />Resolution</span>
        </div>
        {data?.length ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 4" />
                <XAxis dataKey="day_label" axisLine={false} tickLine={false} tickMargin={10} interval={Math.max(0, Math.floor(data.length / 7) - 1)} />
                <YAxis axisLine={false} tickLine={false} tickMargin={8} width={34} allowDecimals={false} />
                <Tooltip content={<ChartTooltip suffix=" breaches" />} />
                <Line type="monotone" dataKey="first_response_breaches" name="First response" stroke="var(--destructive)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="resolution_breaches" name="Resolution" stroke="var(--warning)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <ChartEmpty />}
      </CardContent>
    </Card>
  )
}

function SlaRateRow({ label, metrics, comparison, points = true }) {
  const rate = metrics?.breach_rate
  const met = metrics?.met ?? 0
  const breached = metrics?.breached ?? 0
  const total = metrics?.total ?? met + breached
  const tone = rate >= 30 ? "danger" : rate >= 15 ? "warning" : "positive"
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{number(breached)} breached of {number(total)} known outcomes</p>
        </div>
        <div className="text-right">
          <p className={cn("text-lg font-semibold tabular-nums", tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning-foreground" : "text-positive")}>{percent(rate)}</p>
          <p className="text-[10px] text-muted-foreground">breach rate</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-positive")} style={{ width: `${Math.max(0, Math.min(100, Number(rate) || 0))}%` }} />
      </div>
      {comparison && <div className="mt-1.5"><Delta text={comparisonText(comparison, points ? "points" : "percent")} tone={changeTone(comparison, true, points)} /></div>}
    </div>
  )
}

function AttentionCard({ icon: Icon, label, value, tone, detail, href = "/dashboard/live-operations" }) {
  const toneClass = tone === "danger" ? "bg-destructive/10 text-destructive" : tone === "warning" ? "bg-warning/12 text-warning-foreground" : "bg-primary/10 text-primary"
  return (
    <Link href={href} className="group flex min-w-0 items-start gap-3 rounded-xl border border-border/70 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", toneClass)}><Icon aria-hidden="true" className="size-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium text-muted-foreground">{label}</span>
        <span className="mt-1 block text-[22px] font-semibold leading-none tracking-tight text-foreground tabular-nums">{number(value)}</span>
        <span className="mt-1.5 block text-[10px] leading-4 text-muted-foreground">{detail}</span>
      </span>
      <ArrowRight aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}

function TeamWorkloadChart({ teams }) {
  const chartTeams = (teams ?? []).filter((team) => team.backlog_as_pct_of_daily_capacity !== null && team.backlog_as_pct_of_daily_capacity !== undefined)
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-3">
        <div>
          <CardTitle>Team workload pressure</CardTitle>
          <CardDescription className="mt-1">Estimated outstanding work as a share of one day's capacity</CardDescription>
        </div>
        <Badge variant="muted">Current snapshot</Badge>
      </CardHeader>
      <CardContent>
        {chartTeams.length ? (
          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartTeams} layout="vertical" margin={{ top: 2, right: 28, bottom: 0, left: 2 }} barCategoryGap="26%">
                <CartesianGrid horizontal={false} strokeDasharray="3 4" />
                <XAxis type="number" axisLine={false} tickLine={false} tickMargin={8} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="team_name" axisLine={false} tickLine={false} width={120} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value, name, item) => [`${number(value, 1)}% · ${number(item.payload.active_tickets)} active tickets`, "Backlog / daily capacity"]} cursor={{ fill: "var(--muted)", opacity: 0.45 }} />
                <Bar dataKey="backlog_as_pct_of_daily_capacity" name="Backlog / daily capacity" radius={[0, 5, 5, 0]} maxBarSize={22} isAnimationActive={false}>
                  {chartTeams.map((team) => <Cell key={team.team_id ?? team.team_name} fill={team.backlog_as_pct_of_daily_capacity >= 100 ? "var(--destructive)" : "var(--primary)"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <ChartEmpty message="Team capacity data is not available." />}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-primary" />Within one day's capacity</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-destructive" />Backlog exceeds one day's capacity</span>
        </div>
        {(teams ?? []).some((team) => team.team_id === null) && (
          <p className="mt-3 border-t border-border/70 pt-3 text-[10px] text-muted-foreground">
            Unassigned team: {number(teams.find((team) => team.team_id === null)?.active_tickets)} active tickets · capacity not configured.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryList({ categories }) {
  const max = Math.max(1, ...(categories ?? []).map((item) => Number(item.tickets) || 0))
  return (
    <Card>
      <CardHeader className="pb-3">
        <div><CardTitle>Top ticket categories</CardTitle><CardDescription className="mt-1">Most common reasons customers contact support in this period</CardDescription></div>
        <Badge variant="muted">Period-based</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(categories ?? []).length ? categories.map((item) => (
          <div key={item.category}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-medium text-foreground">{item.category}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{number(item.tickets)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary/80" style={{ width: `${Math.max(2, (Number(item.tickets) / max) * 100)}%` }} />
            </div>
          </div>
        )) : <p className="py-8 text-center text-xs text-muted-foreground">No category data for this period.</p>}
      </CardContent>
    </Card>
  )
}

function BreakdownCard({ title, description, items, colorMap }) {
  const total = (items ?? []).reduce((sum, item) => sum + (Number(item.tickets) || 0), 0)
  return (
    <Card>
      <CardHeader className="pb-3">
        <div><CardTitle>{title}</CardTitle><CardDescription className="mt-1">{description}</CardDescription></div>
        <Badge variant="muted">{number(total)} total</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {(items ?? []).length ? items.map((item) => {
          const key = item.status ?? item.priority
          const color = colorMap[key] ?? "bg-primary"
          const value = Number(item.tickets) || 0
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="capitalize text-foreground">{String(key).replaceAll("_", " ")}</span>
                <span className="tabular-nums text-muted-foreground">{number(value)} <span className="text-muted-foreground/70">({total ? number((value / total) * 100, 1) : 0}%)</span></span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", color)} style={{ width: `${total ? (value / total) * 100 : 0}%` }} /></div>
            </div>
          )
        }) : <p className="py-8 text-center text-xs text-muted-foreground">No breakdown data available.</p>}
      </CardContent>
    </Card>
  )
}

function buildManagerSignals(data) {
  if (!data) return []
  const current = data.current_state ?? {}
  const comparisons = data.comparisons ?? {}
  const signals = []
  const resolutionChange = comparisons.resolution_sla?.change_percentage_points
  if (resolutionChange > 0) {
    signals.push({
      tone: "danger",
      title: "Resolution SLA performance is deteriorating",
      detail: `Resolution breach rate increased by ${number(resolutionChange, 2)} percentage points versus the previous period.`,
    })
  }
  if ((current.tickets_with_overdue_sla ?? 0) > 0) {
    signals.push({
      tone: "danger",
      title: "Overdue tickets need immediate triage",
      detail: `${number(current.tickets_with_overdue_sla)} active tickets currently have an overdue SLA target.`,
    })
  }
  if ((current.backlog_older_than_24h ?? 0) > 0) {
    signals.push({
      tone: "warning",
      title: "Aged backlog remains high",
      detail: `${number(current.backlog_older_than_24h)} active tickets have been open for more than 24 hours.`,
    })
  }
  const highestPressure = (current.team_workload ?? [])
    .filter((team) => team.backlog_as_pct_of_daily_capacity !== null && team.backlog_as_pct_of_daily_capacity !== undefined)
    .sort((a, b) => b.backlog_as_pct_of_daily_capacity - a.backlog_as_pct_of_daily_capacity)[0]
  if (highestPressure && highestPressure.backlog_as_pct_of_daily_capacity >= 100) {
    signals.push({
      tone: "warning",
      title: `${highestPressure.team_name} has a capacity pressure gap`,
      detail: `Its estimated backlog is ${number(highestPressure.backlog_as_pct_of_daily_capacity, 1)}% of one day's capacity.`,
    })
  }
  if (signals.length === 0) {
    signals.push({ tone: "positive", title: "No threshold-based operational alerts", detail: "The current snapshot has no issues above the dashboard's configured alert thresholds." })
  }
  return signals.slice(0, 4)
}

function ManagerSignals({ data }) {
  const signals = buildManagerSignals(data)
  return (
    <Card>
      <CardHeader className="pb-3">
        <div><CardTitle>Manager signals</CardTitle><CardDescription className="mt-1">Rule-based alerts derived from current metrics and period comparisons</CardDescription></div>
        <Badge variant="info">Deterministic</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {signals.map((signal) => (
          <div key={signal.title} className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md", signal.tone === "danger" ? "bg-destructive/10 text-destructive" : signal.tone === "warning" ? "bg-warning/12 text-warning-foreground" : "bg-positive/10 text-positive")}>
              {signal.tone === "positive" ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
            </span>
            <span><span className="block text-xs font-semibold text-foreground">{signal.title}</span><span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{signal.detail}</span></span>
          </div>
        ))}
        <p className="pt-1 text-[10px] text-muted-foreground">These are transparent threshold-based signals, not AI predictions or recommendations.</p>
      </CardContent>
    </Card>
  )
}

function LoadingOverview() {
  return (
    <div className="flex flex-col gap-6" aria-live="polite" aria-busy="true">
      <div className="h-20 animate-pulse rounded-xl bg-muted/50" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-[142px] animate-pulse rounded-xl border border-border/70 bg-card" />)}</div>
      <div className="grid gap-5 xl:grid-cols-2"><div className="h-[340px] animate-pulse rounded-xl bg-card" /><div className="h-[340px] animate-pulse rounded-xl bg-card" /></div>
    </div>
  )
}

function downloadOverview(data) {
  const periodMetrics = data.period_metrics ?? {}
  const current = data.current_state ?? {}
  const sla = periodMetrics.sla ?? {}
  const rows = [
    ["Section", "Metric", "Value"],
    ["Period performance", "Period", data.meta?.period ?? ""],
    ["Period performance", "Tickets received", periodMetrics.tickets_created ?? ""],
    ["Period performance", "Tickets resolved", periodMetrics.tickets_resolved ?? ""],
    ["Period performance", "Average first response (minutes)", periodMetrics.avg_first_response_minutes ?? ""],
    ["Period performance", "Average resolution (minutes)", periodMetrics.avg_resolution_minutes ?? ""],
    ["SLA", "Overall breach rate (%)", sla.overall?.breach_rate ?? ""],
    ["SLA", "First response breach rate (%)", sla.first_response?.breach_rate ?? ""],
    ["SLA", "Resolution breach rate (%)", sla.resolution?.breach_rate ?? ""],
    ["Current state", "Active backlog", current.active_backlog ?? ""],
    ["Current state", "Overdue SLA tickets", current.tickets_with_overdue_sla ?? ""],
    ["Current state", "At-risk within 30 minutes", current.tickets_at_risk_within_30m ?? ""],
    ["Current state", "Unassigned agent tickets", current.unassigned_agent_tickets ?? ""],
    ["Current state", "Backlog older than 24 hours", current.backlog_older_than_24h ?? ""],
  ]
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `opspilot-overview-${data.meta?.period ?? "report"}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function OverviewPage() {
  const { period } = useDashboard()
  const [data, setData] = useState(null)
  const [dataPeriod, setDataPeriod] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadOverview = useCallback(async (isRefresh = false, isCurrent = () => true) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const result = await apiGet(`/overview?period=${encodeURIComponent(period)}`)
      if (!isCurrent()) return
      setData(result)
      setDataPeriod(period)
      setError("")
      setLastUpdated(new Date())
    } catch (requestError) {
      if (!isCurrent()) return
      setError(requestError?.message || "Unable to load overview metrics.")
    } finally {
      if (isCurrent()) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [period])

  useEffect(() => {
    let active = true
    let inFlight = false
    const isCurrent = () => active
    const run = async (refresh = false) => {
      if (inFlight) return
      inFlight = true
      await loadOverview(refresh, isCurrent)
      inFlight = false
    }
    run(false)
    const interval = window.setInterval(() => run(true), 30000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [loadOverview])

  const isCurrentPeriodLoaded = data && dataPeriod === period
  const current = isCurrentPeriodLoaded ? (data.current_state ?? {}) : {}
  const metrics = isCurrentPeriodLoaded ? (data.period_metrics ?? {}) : {}
  const comparisons = isCurrentPeriodLoaded ? (data.comparisons ?? {}) : {}
  const daily = isCurrentPeriodLoaded ? (data.trends?.daily ?? []) : []
  const timezone = data?.meta?.timezone || "Asia/Kolkata"
  const periodLabel = PERIOD_LABELS[period] ?? "Selected period"
  const rangeLabel = isCurrentPeriodLoaded
    ? `${formatDate(data.meta?.period_start, timezone)} – ${formatDate(data.meta?.period_end, timezone)}`
    : periodLabel

  const handleExport = () => {
    if (isCurrentPeriodLoaded) downloadOverview(data)
  }

  // Hooks must run in the same order on every render. Keep this memoized
  // calculation above the loading/error early returns.
  const chartDaily = useMemo(
    () => daily.map((item) => ({ ...item, day_label: formatDayLabel(item.day, timezone) })),
    [daily, timezone],
  )

  if (loading && !isCurrentPeriodLoaded) return <LoadingOverview />

  if (!isCurrentPeriodLoaded && error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="Support operations" title="Operations overview" description="A manager's view of customer demand, service performance, and queue health." />
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-start gap-3 p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><AlertCircle className="size-5" /></span>
            <div><h2 className="text-sm font-semibold text-foreground">Couldn't load the overview</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{error}</p></div>
            <Button size="sm" onClick={() => loadOverview(false)}><RefreshCw data-icon="inline-start" />Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sla = metrics.sla ?? {}
  const teamWorkload = current.team_workload ?? []
  const categories = data?.trends?.top_categories ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Support operations"
        title="Operations overview"
        description="A manager's view of customer demand, service performance, and the work that needs attention."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-lg border border-border/70 bg-card px-3 py-2 text-[10px] text-muted-foreground sm:flex">
              <span className={cn("size-1.5 rounded-full", error ? "bg-warning" : "bg-positive")} />
              {refreshing ? "Refreshing" : "Auto-refresh · 30 sec"}
            </div>
            <Button variant="outline" size="sm" onClick={() => loadOverview(true)} disabled={refreshing}>
              <RefreshCw data-icon="inline-start" className={cn(refreshing && "animate-spin")} />Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download data-icon="inline-start" />Export
            </Button>
          </div>
        )}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/65 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <CalendarClock aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span className="font-semibold text-foreground">{periodLabel}</span>
          <span className="text-muted-foreground">· {rangeLabel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span>Timezone: {timezone}</span>
          <span>Updated: {lastUpdated ? formatDateTime(lastUpdated, timezone) : "—"}</span>
          {error && <span className="text-warning-foreground">Refresh failed; showing last successful data.</span>}
        </div>
      </div>

      <section aria-label="Period performance" className="flex flex-col gap-3">
        <div><SectionEyebrow>Period performance</SectionEyebrow><h2 className="text-sm font-semibold text-foreground">Service delivery</h2><p className="mt-1 text-[11px] text-muted-foreground">Performance within {periodLabel.toLowerCase()}, compared with the previous equal-length period.</p></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard icon={Ticket} label="Tickets received" value={number(metrics.tickets_created)} comparison={comparisons.tickets_created} neutralDelta tone="violet" detail="Created in period" />
          <KpiCard icon={CheckCircle2} label="Tickets resolved" value={number(metrics.tickets_resolved)} comparison={comparisons.tickets_resolved} tone="positive" detail="Resolved in period" />
          <KpiCard icon={Clock3} label="Average first response" value={formatMinutes(metrics.avg_first_response_minutes)} comparison={comparisons.avg_first_response_minutes} inverse tone="info" detail="Elapsed time" />
          <KpiCard icon={Activity} label="Average resolution" value={formatMinutes(metrics.avg_resolution_minutes)} comparison={comparisons.avg_resolution_minutes} inverse tone="warning" detail="Elapsed time" />
          <KpiCard icon={ShieldAlert} label="Overall SLA breach rate" value={percent(sla.overall?.breach_rate)} comparison={comparisons.overall_sla} inverse points tone="danger" detail={`${number(sla.overall?.breached)} of ${number(sla.overall?.total)} outcomes`} />
        </div>
      </section>

      <section aria-label="Current queue health" className="flex flex-col gap-3">
        <div><SectionEyebrow>Current snapshot</SectionEyebrow><h2 className="text-sm font-semibold text-foreground">Queue health & attention required</h2><p className="mt-1 text-[11px] text-muted-foreground">These values represent the current workspace, independent of the selected reporting period.</p></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <AttentionCard icon={Layers3} label="Active backlog" value={current.active_backlog} tone="violet" detail="All unresolved tickets" />
          <AttentionCard icon={ShieldAlert} label="Tickets with overdue SLA" value={current.tickets_with_overdue_sla} tone="danger" detail="At least one active SLA is overdue" />
          <AttentionCard icon={AlertTriangle} label="SLA at risk within 30m" value={current.tickets_at_risk_within_30m} tone="warning" detail="Approaching an SLA deadline" />
          <AttentionCard icon={AlertTriangle} label="High-priority backlog" value={current.high_priority_backlog} tone="warning" detail="Critical and high priority" />
          <AttentionCard icon={UserRoundX} label="Unassigned to an agent" value={current.unassigned_agent_tickets} tone="warning" detail={`${number(current.unassigned_team_tickets)} tickets have no team`} />
          <AttentionCard icon={CalendarClock} label="Backlog older than 24h" value={current.backlog_older_than_24h} tone="danger" detail={`Oldest ticket: ${formatAgeHours(current.oldest_backlog_age_hours)}`} />
        </div>
        <p className="text-[10px] text-muted-foreground">SLA data coverage: {number(current.active_tickets_without_sla_policy)} active tickets without an SLA policy · {number(current.active_tickets_without_sla_deadlines)} without SLA deadlines.</p>
      </section>

      <section aria-label="Ticket trends" className="grid gap-5 xl:grid-cols-2">
        <VolumeChart data={chartDaily} />
        <SlaTrendChart data={chartDaily} />
      </section>

      <section aria-label="SLA and management signals" className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="pb-3">
            <div><CardTitle>SLA performance breakdown</CardTitle><CardDescription className="mt-1">Historical outcomes recorded during the selected period</CardDescription></div>
            <Badge variant="muted">Outcome-based</Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border/70">
            <SlaRateRow label="Overall SLA targets" metrics={sla.overall} comparison={comparisons.overall_sla} />
            <SlaRateRow label="First-response SLA" metrics={sla.first_response} comparison={comparisons.first_response_sla} />
            <SlaRateRow label="Resolution SLA" metrics={sla.resolution} comparison={comparisons.resolution_sla} />
            <p className="pt-3 text-[10px] leading-4 text-muted-foreground">Breach rate = breached SLA outcomes ÷ all known met or breached outcomes. Each first-response and resolution target is counted separately.</p>
          </CardContent>
        </Card>
        <ManagerSignals data={data} />
      </section>

      <section aria-label="Workload and issue distribution" className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <TeamWorkloadChart teams={teamWorkload} />
        <CategoryList categories={categories} />
      </section>

      <section aria-label="Current queue composition" className="grid gap-5 md:grid-cols-2">
        <BreakdownCard
          title="Backlog by status"
          description="Current active ticket distribution"
          items={current.status_breakdown}
          colorMap={{ open: "bg-info", in_progress: "bg-primary", pending_customer: "bg-warning" }}
        />
        <BreakdownCard
          title="Backlog by priority"
          description="Current active ticket distribution"
          items={current.priority_breakdown}
          colorMap={{ critical: "bg-destructive", high: "bg-warning", normal: "bg-primary", low: "bg-info" }}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/60 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground"><Activity className="size-3.5 text-positive" />Metrics calculated by FastAPI from PostgreSQL. Manager signals are rule-based; AI predictions are shown in their dedicated modules.</div>
        <Link href="/dashboard/live-operations" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}>Open live operations <ArrowRight data-icon="inline-end" /></Link>
      </div>
    </div>
  )
}
