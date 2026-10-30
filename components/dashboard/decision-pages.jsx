"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  Check,
  Clock3,
  Flame,
  Gauge,
  Lightbulb,
  MapPinned,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ChartTooltip, ConfirmationDialog, MetricTile, PageHeader, ProgressMeter, SectionHeading, StatusBadge } from "@/components/dashboard/section-shared"
import { recommendations as initialRecommendations, teams as initialTeams } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

function RecommendationCard({ item, onAction }) {
  const completed = ["Approved", "Dismissed"].includes(item.status)
  return (
    <Card className="overflow-hidden">
      <div className={cn("h-1 w-full", item.category === "Staffing" ? "bg-primary" : item.category === "Automation" ? "bg-info" : item.category === "Process" ? "bg-positive" : "bg-chart-4")} />
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center gap-2"><Badge variant="info">{item.category}</Badge><StatusBadge status={item.status} /><span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground"><Users aria-hidden="true" className="size-3.5" />{item.owner}</span></div>
        <h2 className="mt-3 text-sm font-semibold leading-5 text-foreground">{item.title}</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.reason}</p>
        <div className="mt-4 grid gap-3 rounded-lg bg-muted/55 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div><p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Estimated impact</p><p className="mt-1 text-xs font-semibold text-foreground">{item.impact}</p></div>
          <div className="sm:min-w-[132px]"><ProgressMeter label="Confidence" value={item.confidence} meta={`${item.confidence}%`} tone="primary" /></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] text-muted-foreground">Effort <strong className="font-semibold text-foreground">{item.effort}</strong></span>
          <div className="flex gap-2">
            <Link href="/dashboard/ticket-intelligence" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary")}>Review evidence</Link>
            {!completed && <Button size="sm" variant="outline" onClick={() => onAction(item, "dismiss")}>Dismiss</Button>}
            {!completed && <Button size="sm" onClick={() => onAction(item, "approve")}><Check data-icon="inline-start" aria-hidden="true" />Approve</Button>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecommendationsPage() {
  const [items, setItems] = useState(initialRecommendations)
  const [filter, setFilter] = useState("all")
  const [pendingAction, setPendingAction] = useState(null)
  const [notice, setNotice] = useState("")
  const filteredItems = items.filter((item) => filter === "all" || item.status.toLowerCase() === filter)
  const counts = {
    all: items.length,
    pending: items.filter((item) => item.status === "Pending review").length,
    approved: items.filter((item) => item.status === "Approved").length,
    dismissed: items.filter((item) => item.status === "Dismissed").length,
  }

  function confirmAction() {
    if (!pendingAction) return
    const status = pendingAction.action === "approve" ? "Approved" : "Dismissed"
    setItems((current) => current.map((item) => item.id === pendingAction.id ? { ...item, status } : item))
    setNotice(`${pendingAction.title} ${status.toLowerCase()}.`)
    setPendingAction(null)
    window.setTimeout(() => setNotice(""), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="AI decision support"
        title="Recommendations"
        description="Evidence-backed actions ranked by service impact, confidence, and effort. Review before anything changes."
        actions={<Badge variant="warning"><Sparkles data-icon="inline-start" aria-hidden="true" />4 awaiting review</Badge>}
      />
      <section aria-label="Recommendation summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Open recommendations" value={String(counts.pending)} change="Ranked by impact" detail="ready for your review" icon={Lightbulb} tone="warning" />
        <MetricTile label="Estimated monthly impact" value="$99k" change="Across all actions" detail="deflection and efficiency" icon={Zap} tone="positive" />
        <MetricTile label="Average confidence" value="89.5%" change="4 recommendations" detail="model-backed evidence" icon={BadgeCheck} tone="info" />
        <MetricTile label="Lowest effort action" value="2 agents" change="Staffing change" detail="protect Billing SLA" icon={Users} tone="violet" />
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-sm font-semibold text-foreground">Recommended actions</h2><p className="mt-1 text-xs text-muted-foreground">Approvals are local to this demo workspace.</p></div>
        <div className="flex items-center rounded-lg border border-border bg-card p-1" aria-label="Filter recommendations">
          {[{ value: "all", label: "All" }, { value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "dismissed", label: "Dismissed" }].map((option) => <button key={option.value} type="button" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)} className={cn("rounded-md px-3 py-1.5 text-[10px] font-medium", filter === option.value ? "bg-primary/8 text-primary" : "text-muted-foreground hover:text-foreground")}>{option.label}<span className="ml-1.5 tabular-nums opacity-70">{counts[option.value]}</span></button>)}
        </div>
      </div>
      {filteredItems.length > 0 ? <div className="grid gap-4 xl:grid-cols-2">{filteredItems.map((item) => <RecommendationCard key={item.id} item={item} onAction={(recommendation, action) => setPendingAction({ id: recommendation.id, title: recommendation.title, action })} />)}</div> : <Card className="p-6 text-center"><p className="text-sm font-semibold text-foreground">No recommendations in this view</p><p className="mt-1 text-xs text-muted-foreground">Select another status filter to see actions.</p></Card>}
      <Card className="border-primary/15 bg-primary/[0.025]">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot aria-hidden="true" className="size-4" /></span><div><h2 className="text-xs font-semibold text-foreground">How recommendations are ranked</h2><p className="mt-1 max-w-2xl text-[11px] leading-5 text-muted-foreground">Signals are scored using expected customer impact, confidence, operational effort, and the number of teams affected. Recommendations are suggestions only; actions are never applied automatically.</p></div></div>
          <Link href="/dashboard/model-health" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}>Model details <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
        </CardContent>
      </Card>
      <ConfirmationDialog
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={confirmAction}
        title={pendingAction?.action === "approve" ? "Approve this recommendation?" : "Dismiss this recommendation?"}
        description={pendingAction?.action === "approve" ? `${pendingAction?.title} will be marked approved in this demo workspace. No external systems will be changed.` : `${pendingAction?.title} will be removed from the pending review list. You can still view it under dismissed recommendations.`}
        confirmLabel={pendingAction?.action === "approve" ? "Approve recommendation" : "Dismiss recommendation"}
        destructive={pendingAction?.action === "dismiss"}
      />
      {notice && <div role="status" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl border border-positive/20 bg-card px-4 py-3 text-xs font-medium text-foreground shadow-xl"><Check aria-hidden="true" className="size-4 text-positive" />{notice}</div>}
    </div>
  )
}

function CoverageHeatmap() {
  const periods = ["9 AM", "12 PM", "3 PM", "6 PM"]
  const data = [
    { queue: "Billing", values: [68, 96, 91, 72] },
    { queue: "Logistics", values: [72, 88, 86, 64] },
    { queue: "Returns", values: [54, 71, 68, 58] },
    { queue: "Account access", values: [62, 78, 74, 53] },
  ]
  function cellTone(value) {
    return value >= 90 ? "bg-destructive/15 text-destructive" : value >= 80 ? "bg-warning/15 text-warning-foreground" : value >= 65 ? "bg-primary/10 text-primary" : "bg-positive/10 text-positive"
  }

  return (
    <Card>
      <CardHeader className="pb-3"><div><CardTitle>Intraday coverage map</CardTitle><CardDescription className="mt-1">Utilization by queue and peak operating window</CardDescription></div><Badge variant="muted">Today</Badge></CardHeader>
      <CardContent>
        <div className="overflow-x-auto"><table className="w-full min-w-[430px] text-xs"><thead><tr><th scope="col" className="pb-3 text-left text-[10px] font-medium text-muted-foreground">Queue</th>{periods.map((period) => <th key={period} scope="col" className="pb-3 text-center text-[10px] font-medium text-muted-foreground">{period}</th>)}</tr></thead><tbody className="divide-y divide-border/70">{data.map((row) => <tr key={row.queue}><th scope="row" className="py-2.5 text-left text-[11px] font-medium text-foreground">{row.queue}</th>{row.values.map((value, index) => <td key={`${row.queue}-${periods[index]}`} className="px-1 py-2.5"><div className={cn("mx-auto flex h-8 min-w-[52px] items-center justify-center rounded-md text-[10px] font-semibold", cellTone(value))}>{value}%</div></td>)}</tr>)}</tbody></table></div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[9px] text-muted-foreground"><span className="font-medium">Utilization</span><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-positive/40" />Under 65%</span><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-primary/40" />65–79%</span><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-warning/50" />80–89%</span><span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-destructive/45" />90%+</span></div>
      </CardContent>
    </Card>
  )
}

function WorkloadRow({ team, onBalance, balanced }) {
  const tone = team.utilization >= 90 ? "danger" : team.utilization >= 84 ? "warning" : "positive"
  return (
    <div className="grid gap-4 border-b border-border/70 py-4 last:border-0 md:grid-cols-[minmax(160px,1.1fr)_minmax(180px,1.5fr)_90px_90px_120px] md:items-center">
      <div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-[10px] font-semibold text-primary">{team.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><p className="text-xs font-semibold text-foreground">{team.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">Lead: {team.lead}</p></div></div>
      <div><ProgressMeter label="Current utilization" value={team.utilization} meta={`${team.utilization}%`} tone={tone} /><p className="mt-1 text-[9px] text-muted-foreground">Target {team.target}% · {team.active} active agents</p></div>
      <div className="md:text-center"><p className="text-xs font-semibold text-foreground">{team.backlog}</p><p className="mt-1 text-[9px] text-muted-foreground">open tickets</p></div>
      <div className="md:text-center"><p className={cn("text-xs font-semibold", team.change.startsWith("+") ? "text-destructive" : "text-positive")}>{team.change}</p><p className="mt-1 text-[9px] text-muted-foreground">vs last week</p></div>
      <div className="flex justify-end"><Button size="sm" variant={balanced ? "secondary" : "outline"} disabled={balanced} onClick={() => onBalance(team)}>{balanced ? <Check data-icon="inline-start" aria-hidden="true" /> : <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />}{balanced ? "Balanced" : "Balance team"}</Button></div>
    </div>
  )
}

export function WorkloadOptimizationPage() {
  const [teams, setTeams] = useState(initialTeams)
  const [pendingTeam, setPendingTeam] = useState(null)
  const [balancedTeams, setBalancedTeams] = useState([])
  const [notice, setNotice] = useState("")

  function balanceTeam() {
    if (!pendingTeam) return
    const teamName = pendingTeam.name
    setTeams((current) => current.map((team) => team.name === teamName ? { ...team, utilization: Math.max(team.target, team.utilization - 8), backlog: Math.max(0, team.backlog - 24) } : team))
    setBalancedTeams((current) => [...current, teamName])
    setNotice(`${teamName} coverage updated in the demo plan.`)
    setPendingTeam(null)
    window.setTimeout(() => setNotice(""), 3000)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Workforce planning"
        title="Workload optimization"
        description="Compare queue demand with staffing capacity and rebalance coverage before service levels are exposed."
        actions={<Badge variant="warning"><Flame data-icon="inline-start" aria-hidden="true" />2 queues above target</Badge>}
      />
      <section aria-label="Workforce overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Active agents" value="84" change="+4 scheduled" detail="across 5 teams" icon={Users} tone="info" />
        <MetricTile label="Average utilization" value="84%" change="+2.1 pts" detail="planning target 82%" icon={Gauge} tone="warning" />
        <MetricTile label="Queue imbalance" value="18 pts" change="Billing vs Returns" detail="largest capacity spread" icon={SlidersHorizontal} tone="danger" />
        <MetricTile label="Potentially protected" value="312" change="with 2 flex agents" detail="at-risk Billing tickets" icon={ShieldCheck} tone="positive" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Team capacity</CardTitle><CardDescription className="mt-1">Current workload compared with recommended operating range</CardDescription></div><Badge variant="muted">Live plan</Badge></CardHeader>
          <CardContent>
            <div className="hidden grid-cols-[minmax(160px,1.1fr)_minmax(180px,1.5fr)_90px_90px_120px] gap-4 border-b border-border/70 pb-3 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground md:grid"><span>Team</span><span>Utilization</span><span className="text-center">Backlog</span><span className="text-center">Change</span><span className="text-right">Action</span></div>
            {teams.map((team) => <WorkloadRow key={team.name} team={team} balanced={balancedTeams.includes(team.name)} onBalance={setPendingTeam} />)}
          </CardContent>
        </Card>
        <CoverageHeatmap />
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.045] to-card">
          <CardHeader className="pb-3"><div><CardTitle>Recommended shift adjustment</CardTitle><CardDescription className="mt-1">Modelled for the next five business days</CardDescription></div><Badge variant="success">High confidence</Badge></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/85 p-3"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users aria-hidden="true" className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">Move 2 flex agents to Billing</p><p className="mt-1 text-[10px] text-muted-foreground">10am–1pm · Monday through Friday</p></div><span className="text-xs font-semibold text-positive">−8 pts</span></div>
              <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/85 p-3"><span className="flex size-8 items-center justify-center rounded-lg bg-positive/10 text-positive"><MapPinned aria-hidden="true" className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-foreground">Keep Returns coverage flexible</p><p className="mt-1 text-[10px] text-muted-foreground">Use open capacity for weekend return spikes</p></div><span className="text-xs font-semibold text-positive">−24 tickets</span></div>
            </div>
            <Link href="/dashboard/simulations" className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-4 w-full justify-center")}>Model a staffing scenario <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Planning guidance</CardTitle><CardDescription className="mt-1">Guardrails for a balanced operation</CardDescription></div><Clock3 aria-hidden="true" className="size-4 text-primary" /></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {["Keep team utilization within 75–88% for sustainable coverage.", "Reserve flex capacity for delivery and billing peaks between 10am and 1pm.", "Review open-ticket age alongside volume; older work carries greater SLA risk."].map((item, index) => <div key={item} className="flex items-start gap-3"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">{index + 1}</span><p className="text-xs leading-5 text-muted-foreground">{item}</p></div>)}
          </CardContent>
        </Card>
      </section>
      <ConfirmationDialog
        open={Boolean(pendingTeam)}
        onClose={() => setPendingTeam(null)}
        onConfirm={balanceTeam}
        title={`Rebalance ${pendingTeam?.name ?? "team"} coverage?`}
        description={`The demo plan will move flexible capacity toward ${pendingTeam?.name ?? "this team"} and update its utilization and backlog estimate. No external schedule will be changed.`}
        confirmLabel="Apply demo adjustment"
      />
      {notice && <div role="status" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl border border-positive/20 bg-card px-4 py-3 text-xs font-medium text-foreground shadow-xl"><Check aria-hidden="true" className="size-4 text-positive" />{notice}</div>}
    </div>
  )
}

const simulationSchema = z.object({
  weeklyVolume: z.coerce.number().int().min(1000, "Enter at least 1,000 weekly tickets.").max(40000, "Enter no more than 40,000 weekly tickets."),
  additionalAgents: z.coerce.number().int().min(0, "Agent count cannot be negative.").max(20, "Enter no more than 20 additional agents."),
  slaTarget: z.coerce.number().int().min(80, "SLA target must be at least 80%.").max(99, "SLA target cannot exceed 99%."),
})

function ScenarioResults({ volume, agents, slaTarget, runCount }) {
  const currentBreach = 8.3
  const projectedBreach = Math.max(1.5, currentBreach + ((volume - 14200) / 1400) * 1.2 - agents * 0.72 + (95 - slaTarget) * 0.08)
  const currentCapacity = Math.min(120, 91 + ((volume - 14200) / 1400) * 6)
  const projectedCapacity = Math.max(50, currentCapacity - agents * 2.8)
  const chart = [
    { week: "Current", baseline: currentBreach, scenario: projectedBreach },
    { week: "Week 1", baseline: currentBreach + 0.4, scenario: Math.max(1.3, projectedBreach + 0.2) },
    { week: "Week 2", baseline: currentBreach + 0.8, scenario: Math.max(1.2, projectedBreach + 0.1) },
    { week: "Week 3", baseline: currentBreach + 0.5, scenario: Math.max(1.1, projectedBreach - 0.2) },
    { week: "Week 4", baseline: currentBreach + 0.3, scenario: Math.max(1, projectedBreach - 0.4) },
  ]
  const ticketsProtected = Math.max(0, Math.round((currentBreach - projectedBreach) * volume * 0.01))

  return (
    <div className="flex flex-col gap-5">
      <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.05] to-card">
        <CardHeader className="pb-3"><div><CardTitle>Projected impact</CardTitle><CardDescription className="mt-1">Updates as you adjust scenario inputs</CardDescription></div><Badge variant={runCount > 0 ? "success" : "info"}>{runCount > 0 ? "Scenario run" : "Live preview"}</Badge></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/70 bg-card/85 p-3"><p className="text-[10px] text-muted-foreground">SLA breach rate</p><p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{projectedBreach.toFixed(1)}%</p><p className="mt-1 text-[10px] font-medium text-positive">−{(currentBreach - projectedBreach).toFixed(1)} pts vs current</p></div>
            <div className="rounded-lg border border-border/70 bg-card/85 p-3"><p className="text-[10px] text-muted-foreground">Peak utilization</p><p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{projectedCapacity.toFixed(0)}%</p><p className="mt-1 text-[10px] font-medium text-primary">{projectedCapacity <= 88 ? "Within planning range" : "Above 88% guardrail"}</p></div>
            <div className="rounded-lg border border-border/70 bg-card/85 p-3"><p className="text-[10px] text-muted-foreground">Tickets protected</p><p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{ticketsProtected.toLocaleString()}</p><p className="mt-1 text-[10px] text-muted-foreground">estimated over 4 weeks</p></div>
            <div className="rounded-lg border border-border/70 bg-card/85 p-3"><p className="text-[10px] text-muted-foreground">Staffing change</p><p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">+{agents}</p><p className="mt-1 text-[10px] text-muted-foreground">flex agents modeled</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><div><CardTitle>Scenario comparison</CardTitle><CardDescription className="mt-1">Projected SLA breach rate across four weeks</CardDescription></div></CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-muted-foreground/50" />Current plan</span><span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Scenario</span></div>
          <div className="h-[220px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}><CartesianGrid vertical={false} strokeDasharray="3 4" /><XAxis dataKey="week" axisLine={false} tickLine={false} tickMargin={10} /><YAxis axisLine={false} tickLine={false} tickMargin={8} width={42} tickFormatter={(value) => `${value}%`} /><Tooltip content={<ChartTooltip suffix="%" />} /><Line type="monotone" dataKey="baseline" name="Current plan" stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} /><Line type="monotone" dataKey="scenario" name="Scenario" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SimulationPage() {
  const [runCount, setRunCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const { register, watch, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(simulationSchema),
    defaultValues: { weeklyVolume: 14200, additionalAgents: 2, slaTarget: 95 },
    mode: "onTouched",
  })
  const values = watch()
  const volume = Number(values.weeklyVolume) || 0
  const agents = Number(values.additionalAgents) || 0
  const slaTarget = Number(values.slaTarget) || 95

  function runSimulation() {
    setRunCount((current) => current + 1)
    setSaved(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Scenario planning"
        title="What-if simulation"
        description="Test staffing and demand scenarios before committing to a change. Adjust assumptions and compare projected outcomes."
        actions={<Badge variant="info"><WandSparkles data-icon="inline-start" aria-hidden="true" />Interactive model</Badge>}
      />
      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Scenario inputs</CardTitle><CardDescription className="mt-1">All fields are validated before running</CardDescription></div><SlidersHorizontal aria-hidden="true" className="size-4 text-primary" /></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(runSimulation)} noValidate>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.weeklyVolume)}>
                  <FieldLabel htmlFor="weekly-volume">Weekly ticket volume</FieldLabel>
                  <input id="weekly-volume" type="number" min="1000" max="40000" step="100" aria-invalid={Boolean(errors.weeklyVolume)} aria-describedby="weekly-volume-help weekly-volume-error" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 aria-[invalid=true]:border-destructive" {...register("weeklyVolume", { valueAsNumber: true })} />
                  <FieldDescription id="weekly-volume-help">Expected incoming tickets per week, from 1,000 to 40,000.</FieldDescription>
                  <FieldError id="weekly-volume-error">{errors.weeklyVolume?.message}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.additionalAgents)}>
                  <FieldLabel htmlFor="additional-agents">Additional flex agents</FieldLabel>
                  <input id="additional-agents" type="number" min="0" max="20" step="1" aria-invalid={Boolean(errors.additionalAgents)} aria-describedby="additional-agents-help additional-agents-error" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 aria-[invalid=true]:border-destructive" {...register("additionalAgents", { valueAsNumber: true })} />
                  <FieldDescription id="additional-agents-help">Additional agents assigned to the at-risk queues, from 0 to 20.</FieldDescription>
                  <FieldError id="additional-agents-error">{errors.additionalAgents?.message}</FieldError>
                </Field>
                <Field data-invalid={Boolean(errors.slaTarget)}>
                  <FieldLabel htmlFor="sla-target">SLA target (%)</FieldLabel>
                  <input id="sla-target" type="number" min="80" max="99" step="1" aria-invalid={Boolean(errors.slaTarget)} aria-describedby="sla-target-help sla-target-error" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 aria-[invalid=true]:border-destructive" {...register("slaTarget", { valueAsNumber: true })} />
                  <FieldDescription id="sla-target-help">Planning threshold, from 80% to 99%.</FieldDescription>
                  <FieldError id="sla-target-error">{errors.slaTarget?.message}</FieldError>
                </Field>
              </FieldGroup>
              <div className="mt-5 rounded-lg border border-border/70 bg-muted/40 p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Current baseline</p><div className="mt-2 grid grid-cols-2 gap-3"><span className="text-xs text-foreground">SLA breach rate <strong className="ml-1 font-semibold">8.3%</strong></span><span className="text-xs text-foreground">Peak utilization <strong className="ml-1 font-semibold">91%</strong></span></div></div>
              <Button type="submit" className="mt-5 w-full justify-center"><Zap data-icon="inline-start" aria-hidden="true" />Run simulation</Button>
              {runCount > 0 && <Button type="button" variant="ghost" className="mt-1 w-full justify-center text-xs text-primary" onClick={() => setSaved(true)}>{saved ? <Check data-icon="inline-start" aria-hidden="true" /> : <BadgeCheck data-icon="inline-start" aria-hidden="true" />}{saved ? "Scenario saved to this session" : "Save this scenario"}</Button>}
              <p className="mt-3 text-center text-[10px] leading-4 text-muted-foreground">Simulations are illustrative and do not change schedules or customer-facing systems.</p>
            </form>
          </CardContent>
        </Card>
        <ScenarioResults volume={volume} agents={agents} slaTarget={slaTarget} runCount={runCount} />
      </div>
      <Card>
        <CardHeader className="pb-3"><div><CardTitle>How to read this scenario</CardTitle><CardDescription className="mt-1">Planning assumptions behind the comparison</CardDescription></div><Lightbulb aria-hidden="true" className="size-4 text-primary" /></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Gauge aria-hidden="true" className="size-4" /></span><div><p className="text-xs font-semibold text-foreground">Utilization guardrail</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">A team operating below 88% can usually absorb normal demand swings.</p></div></div>
          <div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-positive/10 text-positive"><ShieldCheck aria-hidden="true" className="size-4" /></span><div><p className="text-xs font-semibold text-foreground">SLA effect</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">Additional coverage reduces forecast risk most during known peak windows.</p></div></div>
          <div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info"><BrainCircuit aria-hidden="true" className="size-4" /></span><div><p className="text-xs font-semibold text-foreground">Model confidence</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">Estimates use historical ticket arrival and resolution behavior.</p></div></div>
        </CardContent>
      </Card>
    </div>
  )
}
