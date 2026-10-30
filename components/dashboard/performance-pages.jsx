"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Gauge,
  HardDrive,
  Info,
  LoaderCircle,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartTooltip, MetricTile, PageHeader, ProgressMeter, StatusBadge } from "@/components/dashboard/section-shared"
import { dataSources, dailyOperationsData, outcomeHistory } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

function exportOutcomeData() {
  const rows = [["Week", "Baseline SLA", "Observed SLA"], ...outcomeHistory.map((item) => [item.week, item.baseline, item.outcome])]
  const csv = rows.map((row) => row.join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "opspilot-intervention-outcomes.csv"
  anchor.click()
  URL.revokeObjectURL(url)
}

function OutcomeChart() {
  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>SLA lift after interventions</CardTitle><CardDescription className="mt-1">Observed service level against the no-change baseline</CardDescription></div><Badge variant="success">+5.3 pts</Badge></CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-muted-foreground/55" />Baseline</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Observed outcome</span></div>
        <div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={outcomeHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 4" /><XAxis dataKey="week" axisLine={false} tickLine={false} tickMargin={10} /><YAxis axisLine={false} tickLine={false} tickMargin={8} width={44} domain={[86, 98]} tickFormatter={(value) => `${value}%`} /><Tooltip content={<ChartTooltip suffix="%" />} /><Line type="monotone" dataKey="baseline" name="Baseline SLA" stroke="var(--muted-foreground)" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} /><Line type="monotone" dataKey="outcome" name="Observed SLA" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
      </CardContent>
    </Card>
  )
}

function InterventionTable() {
  const interventions = [
    { name: "Proactive delivery updates", team: "Logistics", launched: "Oct 7", baseline: "14.2%", current: "11.6%", change: "−18.3%", outcome: "Positive" },
    { name: "Midday flex coverage", team: "Billing", launched: "Oct 12", baseline: "8.9%", current: "6.7%", change: "−2.2 pts", outcome: "Positive" },
    { name: "Return-label reminder", team: "Returns", launched: "Oct 18", baseline: "6.4%", current: "5.1%", change: "−20.3%", outcome: "Measuring" },
    { name: "Mobile recovery prompt", team: "Product support", launched: "Oct 21", baseline: "9.7%", current: "8.8%", change: "−0.9 pts", outcome: "Measuring" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>Intervention outcomes</CardTitle><CardDescription className="mt-1">Measured impact from recently launched changes</CardDescription></div><Badge variant="muted">4 tracked</Badge></CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/70"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-muted/55 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-4 py-3">Intervention</th><th scope="col" className="px-4 py-3">Team</th><th scope="col" className="px-4 py-3">Launched</th><th scope="col" className="px-4 py-3">Baseline</th><th scope="col" className="px-4 py-3">Current</th><th scope="col" className="px-4 py-3">Change</th><th scope="col" className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-border/70">{interventions.map((item) => <tr key={item.name} className="bg-card"><th scope="row" className="px-4 py-3.5 font-semibold text-foreground">{item.name}</th><td className="px-4 py-3.5 text-muted-foreground">{item.team}</td><td className="px-4 py-3.5 text-muted-foreground">{item.launched}</td><td className="px-4 py-3.5 tabular-nums text-muted-foreground">{item.baseline}</td><td className="px-4 py-3.5 tabular-nums font-medium text-foreground">{item.current}</td><td className="px-4 py-3.5 font-semibold text-positive">{item.change}</td><td className="px-4 py-3.5"><StatusBadge status={item.outcome} /></td></tr>)}</tbody></table></div>
      </CardContent>
    </Card>
  )
}

export function OutcomesPage() {
  const [exported, setExported] = useState(false)
  function handleExport() {
    exportOutcomeData()
    setExported(true)
    window.setTimeout(() => setExported(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Measurement and attribution"
        title="Interventions & outcomes"
        description="Connect operational changes to measurable customer and service improvements."
        actions={<Button variant="outline" onClick={handleExport}><Download data-icon="inline-start" aria-hidden="true" />{exported ? "Export ready" : "Export outcomes"}</Button>}
      />
      <section aria-label="Intervention outcome summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="SLA lift" value="+5.3 pts" change="Since September" detail="above baseline" icon={ArrowUpRight} tone="positive" />
        <MetricTile label="Repeat contacts" value="−18.3%" change="Delivery updates" detail="largest measured change" icon={ArrowDownRight} tone="positive" />
        <MetricTile label="Interventions active" value="4" change="2 measuring" detail="across 4 teams" icon={Activity} tone="info" />
        <MetricTile label="Hours saved" value="286" change="This month" detail="estimated agent time" icon={Clock3} tone="violet" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <OutcomeChart />
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Impact summary</CardTitle><CardDescription className="mt-1">Attribution across current interventions</CardDescription></div><Badge variant="success">Trending up</Badge></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-xl bg-primary/[0.045] p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Executive summary</p><p className="mt-2 text-xs leading-6 text-foreground/85">Proactive delivery communication is reducing repeat contacts, while midday Billing coverage has improved SLA performance by 2.2 points. Two newer interventions are still collecting enough signal for a confident read.</p></div>
            <div className="flex flex-col gap-3">
              <ProgressMeter label="Intervention adoption" value={78} meta="78%" tone="primary" />
              <ProgressMeter label="Outcome confidence" value={86} meta="86%" tone="positive" />
              <ProgressMeter label="Teams with measurable lift" value={80} meta="4 of 5" tone="info" />
            </div>
            <Link href="/dashboard/recommendations" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}>Review next interventions <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
          </CardContent>
        </Card>
      </section>
      <InterventionTable />
      <Card className="border-info/15 bg-info/[0.035]">
        <CardContent className="flex items-start gap-3 p-4"><Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-info" /><div><p className="text-xs font-semibold text-foreground">Attribution note</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Observed changes compare the four-week window before each intervention with the latest available period. Results are directional and should be reviewed alongside volume mix and seasonality.</p></div></CardContent>
      </Card>
    </div>
  )
}

function modelDataForChart() {
  return dailyOperationsData.slice(-30).map((item, index) => ({
    day: item.day,
    accuracy: Number((92.8 + Math.sin(index * 0.43) * 1.1 + (index / 30) * 0.7).toFixed(1)),
    threshold: 90,
  }))
}

function DataSourceList({ sources, checking }) {
  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>Connected data sources</CardTitle><CardDescription className="mt-1">Freshness and quality across connected systems</CardDescription></div><Badge variant="muted">{sources.length} sources</Badge></CardHeader>
      <CardContent className="flex flex-col gap-2">
        {checking ? sources.map((source) => <div key={source.name} className="flex items-center gap-3 rounded-lg border border-border/65 p-3"><Skeleton className="size-9 rounded-lg" /><div className="flex-1"><Skeleton className="mb-2 h-3 w-32" /><Skeleton className="h-2.5 w-48 max-w-full" /></div><Skeleton className="h-5 w-16 rounded-full" /></div>) : sources.map((source) => (
          <div key={source.name} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/65 p-3 sm:flex-nowrap">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", source.status === "Healthy" ? "bg-positive/10 text-positive" : "bg-warning/12 text-warning-foreground")}><Database aria-hidden="true" className="size-4" /></span>
            <div className="min-w-[150px] flex-1"><p className="text-xs font-semibold text-foreground">{source.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{source.type} · {source.records}</p></div>
            <div className="min-w-[74px] text-right"><p className="text-[10px] font-medium text-foreground">{source.lastSync}</p><p className="mt-1 text-[9px] text-muted-foreground">Last sync</p></div>
            <div className="flex items-center gap-3"><span className="hidden text-[10px] font-medium text-muted-foreground sm:inline">{source.quality}% quality</span><StatusBadge status={source.status} /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ModelRegistry() {
  const models = [
    { name: "SLA risk forecast", version: "v2.8.1", status: "Production", accuracy: "93.4%", updated: "Oct 27, 2026" },
    { name: "Ticket intent classifier", version: "v1.14.0", status: "Production", accuracy: "96.2%", updated: "Oct 25, 2026" },
    { name: "Repeat contact predictor", version: "v1.6.3", status: "Monitoring", accuracy: "91.8%", updated: "Oct 22, 2026" },
  ]
  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>Model registry</CardTitle><CardDescription className="mt-1">Version and validation status</CardDescription></div><Badge variant="success">3 active</Badge></CardHeader>
      <CardContent className="flex flex-col gap-2">
        {models.map((model) => <div key={model.name} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/65 p-3 sm:flex-nowrap"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"><BrainCircuit aria-hidden="true" className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">{model.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{model.version} · Updated {model.updated}</p></div><span className="text-[10px] font-semibold text-foreground">{model.accuracy}</span><Badge variant={model.status === "Production" ? "success" : "info"}>{model.status}</Badge></div>)}
      </CardContent>
    </Card>
  )
}

export function ModelHealthPage() {
  const [sources, setSources] = useState(dataSources)
  const [checking, setChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState("10:16 AM")
  const [notice, setNotice] = useState("")
  const chartData = useMemo(() => modelDataForChart(), [])
  const delayedSources = sources.filter((source) => source.status === "Delayed").length

  function runChecks() {
    setChecking(true)
    window.setTimeout(() => {
      setSources((current) => current.map((source) => ({ ...source, status: "Healthy", lastSync: "just now" })))
      setLastCheck("Just now")
      setChecking(false)
      setNotice("Health checks completed. All sources are connected.")
      window.setTimeout(() => setNotice(""), 3000)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Platform observability"
        title="Model & data health"
        description="Monitor model performance, source freshness, and quality signals that support confident decisions."
        actions={<Button variant="outline" onClick={runChecks} disabled={checking}>{checking ? <LoaderCircle data-icon="inline-start" aria-hidden="true" className="animate-spin" /> : <RotateCw data-icon="inline-start" aria-hidden="true" />}{checking ? "Checking sources..." : "Run health checks"}</Button>}
      />
      {delayedSources > 0 && <Alert variant="destructive"><ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning-foreground" /><div><AlertTitle>One data source is behind its freshness target</AlertTitle><AlertDescription className="mt-1">Carrier event stream last synced 11 minutes ago. Delivery forecast confidence is temporarily reduced while the connector retries.</AlertDescription></div></Alert>}
      <section aria-label="Model and data health metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Overall health score" value={delayedSources ? "94.8" : "98.6"} change={delayedSources ? "−1.2 pts" : "+0.4 pts"} detail="system reliability" icon={Gauge} tone={delayedSources ? "warning" : "positive"} />
        <MetricTile label="Model confidence" value="93.4%" change="Within range" detail="SLA risk forecast" icon={ShieldCheck} tone="positive" />
        <MetricTile label="Data freshness" value={delayedSources ? "11 min" : "2 min"} change={delayedSources ? "1 source delayed" : "All sources current"} detail="latest event arrival" icon={Clock3} tone={delayedSources ? "warning" : "info"} />
        <MetricTile label="Prediction drift" value="0.7%" change="−0.2 pts" detail="alert threshold 3%" icon={Activity} tone="positive" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Forecast model accuracy</CardTitle><CardDescription className="mt-1">Daily backtest accuracy against the 90% guardrail</CardDescription></div><Badge variant="success">Stable</Badge></CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Accuracy</span><span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-destructive" />Alert threshold</span></div>
            <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} interval={5} /><YAxis axisLine={false} tickLine={false} tickMargin={8} width={44} domain={[86, 100]} tickFormatter={(value) => `${value}%`} /><Tooltip content={<ChartTooltip suffix="%" />} /><Line type="monotone" dataKey="threshold" name="Guardrail" stroke="var(--destructive)" strokeDasharray="4 5" strokeWidth={1.5} dot={false} isAnimationActive={false} /><Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
            <p className="mt-2 text-[10px] text-muted-foreground">Last model validation: October 27, 2026 · 30-day rolling window</p>
          </CardContent>
        </Card>
        <DataSourceList sources={sources} checking={checking} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <ModelRegistry />
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Quality controls</CardTitle><CardDescription className="mt-1">Automated checks running for this workspace</CardDescription></div><Badge variant="success">Active</Badge></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              { label: "Schema validation", value: "99.9% pass rate", icon: CheckCircle2 },
              { label: "Duplicate event detection", value: "0.02% duplicates", icon: Database },
              { label: "Feature freshness", value: "Within 5-minute SLA", icon: Clock3 },
              { label: "Drift monitoring", value: "No threshold alerts", icon: Activity },
            ].map((control) => {
              const Icon = control.icon
              return <div key={control.label} className="flex items-center gap-3 rounded-lg border border-border/65 px-3 py-3"><span className="flex size-8 items-center justify-center rounded-lg bg-positive/10 text-positive"><Icon aria-hidden="true" className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">{control.label}</p><p className="mt-1 text-[10px] text-muted-foreground">{control.value}</p></div><CheckCircle2 aria-hidden="true" className="size-4 text-positive" /></div>
            })}
            <p className="mt-1 text-[10px] text-muted-foreground">Last complete health check: {lastCheck}</p>
          </CardContent>
        </Card>
      </section>
      {notice && <div role="status" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl border border-positive/20 bg-card px-4 py-3 text-xs font-medium text-foreground shadow-xl"><Check aria-hidden="true" className="size-4 text-positive" />{notice}</div>}
    </div>
  )
}

const settingsSchema = z.object({
  workspaceName: z.string().trim().min(2, "Workspace name must contain at least 2 characters.").max(60, "Workspace name must be 60 characters or fewer."),
  timezone: z.string().min(1, "Select a reporting time zone."),
})

export function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [preferences, setPreferences] = useState({ sla: true, recommendations: true, dataHealth: true, weeklyDigest: false })
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: { workspaceName: "Northstar Support", timezone: "America/Los_Angeles" },
    mode: "onTouched",
  })

  function saveSettings() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2600)
  }

  function updatePreference(key) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }))
    setSaved(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Workspace configuration" title="Settings" description="Manage workspace details, notification preferences, and reporting defaults." />
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Workspace profile</CardTitle><CardDescription className="mt-1">Organization and reporting defaults</CardDescription></div><SlidersHorizontal aria-hidden="true" className="size-4 text-primary" /></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(saveSettings)} noValidate>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.workspaceName)}>
                  <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
                  <input id="workspace-name" aria-invalid={Boolean(errors.workspaceName)} aria-describedby="workspace-name-help workspace-name-error" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 aria-[invalid=true]:border-destructive" {...register("workspaceName")} />
                  <FieldDescription id="workspace-name-help">Shown to members in the workspace switcher.</FieldDescription>
                  <FieldError id="workspace-name-error">{errors.workspaceName?.message}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.timezone)}>
                  <FieldLabel htmlFor="reporting-timezone">Reporting time zone</FieldLabel>
                  <select id="reporting-timezone" aria-invalid={Boolean(errors.timezone)} aria-describedby="reporting-timezone-help reporting-timezone-error" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 aria-[invalid=true]:border-destructive" {...register("timezone")}>
                    <option value="America/Los_Angeles">Pacific Time (US & Canada)</option><option value="America/Denver">Mountain Time</option><option value="America/Chicago">Central Time</option><option value="America/New_York">Eastern Time</option><option value="UTC">UTC</option>
                  </select>
                  <FieldDescription id="reporting-timezone-help">Applies to reports, activity timestamps, and daily cutoffs.</FieldDescription>
                  <FieldError id="reporting-timezone-error">{errors.timezone?.message}</FieldError>
                </Field>
                <div className="rounded-lg border border-border/70 bg-muted/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Workspace ID</p><p className="mt-1 font-mono text-xs text-foreground">ws_northstar_4f82a1</p></div>
              </FieldGroup>
              <Button type="submit" className="mt-5"><Check data-icon="inline-start" aria-hidden="true" />{saved ? "Settings saved" : "Save workspace settings"}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Notifications</CardTitle><CardDescription className="mt-1">Choose which operational updates appear in your workspace</CardDescription></div><BellRing aria-hidden="true" className="size-4 text-primary" /></CardHeader>
          <CardContent>
            <FieldSet>
              <FieldLegend>Alert preferences</FieldLegend>
              <FieldGroup>
                {[
                  { key: "sla", label: "SLA risk alerts", description: "When a queue or ticket approaches its response target." },
                  { key: "recommendations", label: "New AI recommendations", description: "When a high-confidence action is ready for review." },
                  { key: "dataHealth", label: "Data source health", description: "When a connector falls behind its freshness target." },
                  { key: "weeklyDigest", label: "Weekly operations digest", description: "A Monday summary of performance and emerging themes." },
                ].map((item) => (
                  <Field key={item.key} orientation="horizontal" className="rounded-lg border border-border/70 px-3 py-3">
                    <div className="min-w-0 flex-1"><FieldLabel htmlFor={`pref-${item.key}`}>{item.label}</FieldLabel><FieldDescription className="mt-1">{item.description}</FieldDescription></div>
                    <input id={`pref-${item.key}`} type="checkbox" checked={preferences[item.key]} onChange={() => updatePreference(item.key)} className="size-4 shrink-0 accent-primary" />
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-[10px] text-muted-foreground"><Info aria-hidden="true" className="size-3.5 shrink-0" />Notification preferences are saved for this demo session only.</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><div><CardTitle>Workspace access</CardTitle><CardDescription className="mt-1">Team members with access to this operations workspace</CardDescription></div><Badge variant="muted">4 members</Badge></CardHeader>
        <CardContent><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ name: "Jordan Lee", role: "Operations admin", initials: "JL" }, { name: "Mina Kim", role: "Team lead · Logistics", initials: "MK" }, { name: "Sophie Chen", role: "Team lead · Support", initials: "SC" }, { name: "Marcus Ortiz", role: "Analyst", initials: "MO" }].map((person) => <div key={person.name} className="flex items-center gap-3 rounded-lg border border-border/70 p-3"><span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{person.initials}</span><div><p className="text-xs font-semibold text-foreground">{person.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{person.role}</p></div></div>)}</div></CardContent>
      </Card>
      {saved && <div role="status" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl border border-positive/20 bg-card px-4 py-3 text-xs font-medium text-foreground shadow-xl"><CheckCircle2 aria-hidden="true" className="size-4 text-positive" />Workspace settings saved for this session.</div>}
    </div>
  )
}
