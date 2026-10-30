"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChartNoAxesCombined,
  Clock3,
  Download,
  Gauge,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip, MetricTile, PageHeader, ProgressMeter } from "@/components/dashboard/section-shared"
import { dailyOperationsData, forecastData, monthlyHistory } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

function ForecastFactors() {
  const factors = [
    { label: "Ticket arrival trend", impact: "High", direction: "Increasing demand", score: 87, tone: "warning" },
    { label: "Agent schedule coverage", impact: "Medium", direction: "Stable coverage", score: 74, tone: "info" },
    { label: "Carrier event latency", impact: "High", direction: "Elevated risk", score: 83, tone: "danger" },
    { label: "Recent resolution velocity", impact: "Positive", direction: "Improving", score: 91, tone: "positive" },
  ]
  const toneMap = { warning: "warning", info: "info", danger: "danger", positive: "positive" }

  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>Forecast drivers</CardTitle><CardDescription className="mt-1">Signals influencing the next two weeks</CardDescription></div><BrainCircuit aria-hidden="true" className="size-4 text-primary" /></CardHeader>
      <CardContent className="flex flex-col gap-4">
        {factors.map((factor) => (
          <div key={factor.label}>
            <div className="mb-2 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-foreground">{factor.label}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{factor.direction}</p></div><Badge variant={factor.tone}>{factor.impact}</Badge></div>
            <ProgressMeter value={factor.score} tone={toneMap[factor.tone]} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ForecastChart() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div><CardTitle>Capacity demand forecast</CardTitle><CardDescription className="mt-1">Predicted utilization against available staffing</CardDescription></div>
        <Badge variant="info">14-day forecast</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Actual utilization</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" />Projected utilization</span>
          <span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-primary/40" />Confidence range</span>
        </div>
        <div className="h-[330px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs><linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--info)" stopOpacity={0.12} /><stop offset="100%" stopColor="var(--info)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} interval={1} />
              <YAxis axisLine={false} tickLine={false} tickMargin={8} width={44} domain={[60, 120]} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<ChartTooltip suffix="%" />} />
              <Area type="monotone" dataKey="upper" name="Confidence upper" stroke="var(--primary)" strokeOpacity={0.2} strokeDasharray="3 5" fill="url(#forecastFill)" fillOpacity={0.45} dot={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="lower" name="Confidence lower" stroke="var(--primary)" strokeOpacity={0.2} strokeDasharray="3 5" fill="white" fillOpacity={0.72} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="actual" name="Actual utilization" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }} connectNulls isAnimationActive={false} />
              <Line type="monotone" dataKey="forecast" name="Projected utilization" stroke="var(--info)" strokeWidth={2.5} strokeDasharray="6 4" dot={false} connectNulls isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/8 p-3 text-xs"><ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning-foreground" /><p className="leading-5 text-foreground"><strong className="font-semibold">Capacity alert:</strong> projected demand may exceed current staffing by 7% on November 6. Two flex agents would keep forecast utilization below the 90% planning threshold.</p></div>
      </CardContent>
    </Card>
  )
}

export function PredictiveAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Forward-looking signals"
        title="Predictive analytics"
        description="See demand and service risk before they show up in the queue, with confidence ranges and the factors behind each forecast."
        actions={<Badge variant="success"><span className="mr-1.5 size-1.5 rounded-full bg-positive" />Model confidence 93.4%</Badge>}
      />
      <section aria-label="Forecast summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Forecast ticket volume" value="14.2k" change="+6.8%" detail="next 14 days" icon={ChartNoAxesCombined} tone="info" />
        <MetricTile label="Projected SLA breach" value="8.3%" change="−1.2 pts" detail="with current staffing" icon={ShieldCheck} tone="positive" />
        <MetricTile label="Peak utilization" value="102%" change="Nov 6" detail="projected capacity peak" icon={Users} tone="warning" />
        <MetricTile label="Forecast horizon" value="14 days" change="Daily refresh" detail="last updated 10:12 AM" icon={CalendarDays} tone="violet" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <ForecastChart />
        <ForecastFactors />
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Upcoming service risks</CardTitle><CardDescription className="mt-1">Forecasts with the highest likely impact</CardDescription></div><Badge variant="warning">3 watch items</Badge></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { date: "Nov 4–6", title: "Billing queue peak", detail: "Projected volume exceeds weekday capacity by 7%.", level: "High" },
              { date: "Nov 7", title: "Carrier scan latency", detail: "Delivery-status repeat contacts may rise 12%.", level: "High" },
              { date: "Nov 10", title: "Weekend returns coverage", detail: "Forecast understaffing could expose 64 tickets.", level: "Moderate" },
            ].map((risk) => (
              <div key={risk.title} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/70 px-3 py-3 sm:flex-nowrap">
                <span className="min-w-[62px] text-[10px] font-semibold text-muted-foreground">{risk.date}</span>
                <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">{risk.title}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{risk.detail}</p></div>
                <Badge variant={risk.level === "High" ? "danger" : "warning"}>{risk.level}</Badge>
              </div>
            ))}
            <Link href="/dashboard/recommendations" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-1 w-fit text-primary")}>View suggested actions <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Planning note</CardTitle><CardDescription className="mt-1">What is driving the next forecast update</CardDescription></div><Lightbulb aria-hidden="true" className="size-4 text-primary" /></CardHeader>
          <CardContent>
            <p className="text-xs leading-6 text-foreground/85">The model blends ticket arrival patterns, agent schedule coverage, carrier-event latency, and recent resolution velocity. It expects demand to remain manageable overall, with concentrated pressure in Billing and Logistics during weekday midday peaks.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-[10px] text-muted-foreground">Historical accuracy</p><p className="mt-1 text-lg font-semibold text-foreground">91.8%</p></div>
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-[10px] text-muted-foreground">Last backtest</p><p className="mt-1 text-lg font-semibold text-foreground">Oct 27</p></div>
            </div>
            <Link href="/dashboard/model-health" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full justify-center")}>View model health <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function HistoricalVolumeChart({ data }) {
  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>Monthly ticket volume</CardTitle><CardDescription className="mt-1">Demand trend over the selected window</CardDescription></div><Badge variant="muted">Tickets</Badge></CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs><linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.16} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tickMargin={8} width={44} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip content={<ChartTooltip suffix=" tickets" />} />
              <Area type="monotone" dataKey="tickets" name="Tickets" stroke="var(--primary)" strokeWidth={2.5} fill="url(#historyFill)" activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoricalSlaChart({ data }) {
  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>SLA and resolution trend</CardTitle><CardDescription className="mt-1">Service level and average hours to resolution</CardDescription></div><Badge variant="success">Steady improvement</Badge></CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-positive" />SLA met</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" />Resolution time</span></div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tickMargin={8} width={42} domain={[85, 100]} tickFormatter={(value) => `${value}%`} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickMargin={8} width={38} domain={[3, 7]} tickFormatter={(value) => `${value}h`} />
              <Tooltip content={<ChartTooltip />} />
              <Line yAxisId="left" type="monotone" dataKey="sla" name="SLA met" stroke="var(--positive)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--positive)", strokeWidth: 0 }} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="resolution" name="Resolution time" stroke="var(--info)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--info)", strokeWidth: 0 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function exportHistoricalCsv(data) {
  const rows = [["Month", "Tickets", "SLA met (%)", "Average resolution (hours)"], ...data.map((item) => [item.month, item.tickets, item.sla, item.resolution])]
  const csv = rows.map((row) => row.join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "opspilot-historical-analytics.csv"
  anchor.click()
  URL.revokeObjectURL(url)
}

export function HistoricalAnalyticsPage() {
  const [range, setRange] = useState("12m")
  const data = useMemo(() => range === "6m" ? monthlyHistory.slice(-6) : monthlyHistory, [range])
  const [exported, setExported] = useState(false)

  function handleExport() {
    exportHistoricalCsv(data)
    setExported(true)
    window.setTimeout(() => setExported(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Historical performance"
        title="Historical analytics"
        description="Understand how demand, service levels, and resolution efficiency have changed over time."
        actions={<Button variant="outline" onClick={handleExport}><Download data-icon="inline-start" aria-hidden="true" />{exported ? "Export ready" : "Export data"}</Button>}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-xs"><CalendarDays aria-hidden="true" className="size-4 text-muted-foreground" /><span className="font-medium text-foreground">Reporting period</span><span className="text-muted-foreground">· Nov 2025 to Oct 2026</span></div>
        <label className="sr-only" htmlFor="history-range">Historical range</label>
        <select id="history-range" value={range} onChange={(event) => setRange(event.target.value)} className="h-8 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"><option value="12m">Last 12 months</option><option value="6m">Last 6 months</option></select>
      </div>
      <section aria-label="Historical analytics summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Ticket volume" value="15,480" change="+2.2%" detail="vs September" icon={TrendingUp} tone="info" />
        <MetricTile label="SLA met" value="96.1%" change="+0.4 pts" detail="12-month high" icon={ShieldCheck} tone="positive" />
        <MetricTile label="Resolution time" value="4.2h" change="−0.1h" detail="best in 12 months" icon={Clock3} tone="positive" />
        <MetricTile label="Peak month" value="October" change="15.5k tickets" detail="seasonal demand" icon={ChartNoAxesCombined} tone="violet" />
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <HistoricalVolumeChart data={data} />
        <HistoricalSlaChart data={data} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Performance by team</CardTitle><CardDescription className="mt-1">October service outcomes compared to the prior month</CardDescription></div><Badge variant="muted">October</Badge></CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border/70">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="bg-muted/55 text-[10px] uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-4 py-3">Team</th><th scope="col" className="px-4 py-3">Volume</th><th scope="col" className="px-4 py-3">SLA met</th><th scope="col" className="px-4 py-3">Avg. resolution</th><th scope="col" className="px-4 py-3">Change</th></tr></thead>
                <tbody className="divide-y divide-border/70">
                  {[
                    { team: "Billing", volume: "3,180", sla: "94.2%", resolution: "4.8h", change: "+4.1%" },
                    { team: "Logistics", volume: "4,216", sla: "95.1%", resolution: "4.2h", change: "+2.8%" },
                    { team: "Returns", volume: "2,086", sla: "96.8%", resolution: "3.9h", change: "−3.4%" },
                    { team: "Account access", volume: "1,740", sla: "97.2%", resolution: "3.4h", change: "−1.6%" },
                  ].map((row) => <tr key={row.team} className="bg-card"><th scope="row" className="px-4 py-3.5 font-semibold text-foreground">{row.team}</th><td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.volume}</td><td className="px-4 py-3.5 font-medium text-foreground">{row.sla}</td><td className="px-4 py-3.5 text-muted-foreground">{row.resolution}</td><td className={cn("px-4 py-3.5 font-semibold", row.change.startsWith("+") ? "text-primary" : "text-positive")}>{row.change}</td></tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.045] to-card">
          <CardHeader className="pb-3"><div><CardTitle>Year-over-year signal</CardTitle><CardDescription className="mt-1">What the historical pattern suggests</CardDescription></div><Gauge aria-hidden="true" className="size-4 text-primary" /></CardHeader>
          <CardContent>
            <p className="text-xs leading-6 text-foreground/85">Ticket volume has risen steadily since spring while SLA performance improved by 6.9 points. Resolution time fell 1.5 hours, suggesting recent process and staffing changes are absorbing demand more effectively.</p>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border/65 bg-card/80 px-3 py-3"><span className="text-xs text-muted-foreground">Volume growth</span><span className="text-sm font-semibold text-foreground">+41.8%</span></div>
              <div className="flex items-center justify-between rounded-lg border border-border/65 bg-card/80 px-3 py-3"><span className="text-xs text-muted-foreground">SLA improvement</span><span className="text-sm font-semibold text-positive">+6.9 pts</span></div>
              <div className="flex items-center justify-between rounded-lg border border-border/65 bg-card/80 px-3 py-3"><span className="text-xs text-muted-foreground">Resolution reduction</span><span className="text-sm font-semibold text-positive">−26.3%</span></div>
            </div>
            <Link href="/dashboard/outcomes" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full justify-center")}>Connect outcomes to changes <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
          </CardContent>
        </Card>
      </section>
      <p className="text-center text-[10px] text-muted-foreground">Historical dashboard data is illustrative and does not represent a live source.</p>
    </div>
  )
}
