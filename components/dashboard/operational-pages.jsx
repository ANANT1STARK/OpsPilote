"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  ArrowRight,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Headphones,
  PackageCheck,
  Search,
  ShieldAlert,
  RefreshCw,
  Ticket,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip, EmptyState, MetricTile, PageHeader, ProgressMeter, SectionHeading, StatusBadge } from "@/components/dashboard/section-shared"
import { driverChartData, issueClusters } from "@/lib/dashboard-data"
import { apiGet } from "@/lib/api"
import { cn } from "@/lib/utils"

function formatTicketAge(createdAt) {
  if (!createdAt) return "—"
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return "—"
  const minutes = Math.max(0, Math.floor((Date.now() - created.getTime()) / 60000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

function titleCase(value) {
  if (!value) return "Unknown"
  return String(value).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function toLiveTicket(item) {
  const sla = {
    breached: "Breached",
    at_risk: "At risk",
    on_track: "On track",
    met: "Met",
    unknown: "Unknown",
  }
  return {
    id: item.external_id || String(item.id),
    databaseId: item.id,
    subject: item.subject || "Untitled ticket",
    customer: item.customer_display_name || item.customer_reference || "Unknown customer",
    queue: item.assigned_team_name || "Unassigned team",
    owner: item.assigned_user_name || "Unassigned",
    priority: titleCase(item.priority),
    status: titleCase(item.status),
    age: formatTicketAge(item.created_at),
    sla: sla[String(item.sla_status || "unknown").toLowerCase()] || titleCase(item.sla_status),
    createdAt: item.created_at,
    firstResponseDueAt: item.first_response_due_at,
    resolutionDueAt: item.resolution_due_at,
    sourceChannel: item.source_channel,
    category: item.category,
  }
}

function TeamWorkloadCard({ team }) {
  const rawPercentage = team.backlog_as_pct_of_daily_capacity
  const hasCapacity = rawPercentage !== null && rawPercentage !== undefined && Number.isFinite(Number(rawPercentage))
  const percentage = hasCapacity ? Number(rawPercentage) : 0
  const tone = !hasCapacity ? "muted" : percentage >= 200 ? "danger" : percentage >= 100 ? "warning" : "positive"
  const width = hasCapacity ? Math.min(100, Math.max(0, percentage)) : 0
  const hours = Math.round((Number(team.estimated_backlog_minutes) || 0) / 60)
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="truncate text-xs font-semibold text-foreground">{team.team_name}</p><p className="mt-1 text-[10px] text-muted-foreground">{team.active_tickets} active tickets · about {hours.toLocaleString()}h estimated work</p></div>
        <Badge variant={tone === "danger" ? "danger" : tone === "warning" ? "warning" : tone === "positive" ? "success" : "muted"}>{hasCapacity ? `${percentage.toFixed(1)}%` : "No capacity"}</Badge>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-positive"}`} style={{ width: `${width}%` }} /></div>
      <p className="mt-2 text-[10px] text-muted-foreground">Backlog compared with one day's capacity{hasCapacity ? ` · ${Number(team.daily_capacity_minutes).toLocaleString()} min/day` : " · capacity not configured"}</p>
    </div>
  )
}

function TicketDetails({ ticket, onClear }) {
  if (!ticket) return null
  return (
    <Card className="border-primary/20 bg-primary/[0.025]">
      <CardHeader className="pb-3">
        <div><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{ticket.id}</Badge><StatusBadge status={ticket.sla} /><Badge variant="muted">{ticket.status}</Badge></div><CardTitle className="mt-3 text-base">{ticket.subject}</CardTitle><CardDescription className="mt-1">Customer {ticket.customer} · {ticket.queue} · Opened {ticket.age} ago</CardDescription></div>
        <Button variant="ghost" size="icon-sm" aria-label="Clear selected ticket" onClick={onClear}><span aria-hidden="true">×</span></Button>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Current owner</p><p className="mt-1 text-xs font-semibold text-foreground">{ticket.owner}</p></div>
        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Priority</p><p className="mt-1 text-xs font-semibold text-foreground">{ticket.priority}</p></div>
        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Category / channel</p><p className="mt-1 text-xs font-semibold text-foreground">{ticket.category || "—"} · {ticket.sourceChannel || "—"}</p></div>
        <div className="rounded-lg bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">Resolution deadline</p><p className="mt-1 text-xs font-semibold text-foreground">{ticket.resolutionDueAt ? new Date(ticket.resolutionDueAt).toLocaleString() : "Not set"}</p></div>
      </CardContent>
    </Card>
  )
}

export function LiveOperationsPage() {
  const [tickets, setTickets] = useState([])
  const [overview, setOverview] = useState(null)
  const [totalTickets, setTotalTickets] = useState(0)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [overviewError, setOverviewError] = useState("")
  const [lastSynced, setLastSynced] = useState(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  const offset = (page - 1) * pageSize
  const pageCount = Math.max(1, Math.ceil(totalTickets / pageSize))

  useEffect(() => {
    let active = true
    let intervalId
    let debounceId

    async function loadData(showLoading = false) {
      if (showLoading && active) setLoading(true)
      if (active) {
        setError("")
        setRefreshing(true)
      }

      const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) })
      if (query.trim()) params.set("search", query.trim())
      if (filter !== "all") params.set("status", filter)

      const [ticketResult, overviewResult] = await Promise.allSettled([
        apiGet(`/tickets?${params.toString()}`),
        apiGet("/overview?period=7d"),
      ])

      if (!active) return

      if (ticketResult.status === "fulfilled") {
        const payload = ticketResult.value
        setTickets(Array.isArray(payload.items) ? payload.items.map(toLiveTicket) : [])
        setTotalTickets(Number(payload.total) || 0)
        setLastSynced(new Date())
      } else {
        setError(ticketResult.reason?.message || "Unable to load tickets from the backend.")
      }

      if (overviewResult.status === "fulfilled") {
        setOverview(overviewResult.value)
        setOverviewError("")
      } else {
        setOverviewError(overviewResult.reason?.message || "Live summary is unavailable.")
      }

      setLoading(false)
      setRefreshing(false)
    }

    debounceId = window.setTimeout(() => {
      loadData(true)
      intervalId = window.setInterval(() => loadData(false), 30000)
    }, query.trim() ? 300 : 0)

    return () => {
      active = false
      window.clearTimeout(debounceId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [page, pageSize, query, filter, refreshNonce, offset])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const current = overview?.current_state ?? {}
  const teamWorkload = current.team_workload ?? []
  const startRow = totalTickets === 0 ? 0 : offset + 1
  const endRow = Math.min(offset + tickets.length, totalTickets)

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter)
    setPage(1)
    setSelectedTicket(null)
  }

  function handleQueryChange(value) {
    setQuery(value)
    setPage(1)
    setSelectedTicket(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Live command center"
        title="Live operations"
        description="Monitor queues, spot SLA exposure, and review the tickets that need operational attention."
        actions={<Button variant="outline" onClick={() => setRefreshNonce((value) => value + 1)} disabled={refreshing}><RefreshCw data-icon="inline-start" aria-hidden="true" className={refreshing ? "animate-spin" : ""} />{refreshing ? "Refreshing…" : "Refresh queues"}</Button>}
      />
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-positive/15 bg-positive/[0.045] px-4 py-3 text-xs text-foreground">
        <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-positive opacity-35" /><span className="relative inline-flex size-2 rounded-full bg-positive" /></span>
        <span className="font-semibold">Backend ticket feed</span><span className="text-muted-foreground">Refreshes every 30 seconds</span><span className="ml-auto text-[10px] text-muted-foreground">{lastSynced ? `Last synced ${lastSynced.toLocaleTimeString()}` : "Waiting for first sync"}</span>
      </div>

      <section aria-label="Live operational metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Active backlog" value={current.active_backlog ?? "—"} change="Current snapshot" detail="Unresolved tickets across the workspace" icon={Headphones} tone="info" />
        <MetricTile label="Unassigned tickets" value={current.unassigned_agent_tickets ?? "—"} change="Needs ownership" detail="Not assigned to an agent" icon={Ticket} tone="warning" />
        <MetricTile label="Overdue SLA tickets" value={current.tickets_with_overdue_sla ?? "—"} change="Requires attention" detail="At least one active SLA is overdue" icon={ShieldAlert} tone="danger" />
        <MetricTile label="High-priority backlog" value={current.high_priority_backlog ?? "—"} change="Current snapshot" detail="Critical and high-priority active tickets" icon={Clock3} tone="warning" />
      </section>
      {overviewError && <p className="text-xs text-warning">Live summary unavailable: {overviewError}</p>}

      <section aria-labelledby="queue-pressure-title">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h2 id="queue-pressure-title" className="text-sm font-semibold text-foreground">Team workload pressure</h2><p className="mt-1 text-xs text-muted-foreground">Estimated backlog compared with one day's team capacity</p></div><Link href="/dashboard/workload-optimization" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-primary")}>Optimize coverage <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link></div>
        {teamWorkload.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{teamWorkload.map((team) => <TeamWorkloadCard key={team.team_id || "unassigned"} team={team} />)}</div> : <div className="rounded-xl border border-dashed border-border p-5 text-xs text-muted-foreground">Team workload data is not available yet.</div>}
      </section>

      <Card>
        <CardHeader className="pb-4">
          <div><CardTitle>Ticket queue</CardTitle><CardDescription className="mt-1">Search and navigate the complete workspace ticket list.</CardDescription></div>
          <Badge variant="outline">{totalTickets.toLocaleString()} total tickets</Badge>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-[340px]">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input aria-label="Search tickets" value={query} onChange={(event) => handleQueryChange(event.target.value)} placeholder="Search ID, subject, or customer..." className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground"><Filter aria-hidden="true" className="size-3.5" />Status</span>
              {[{ value: "all", label: "All tickets" }, { value: "open", label: "Open" }, { value: "in_progress", label: "In progress" }, { value: "pending_customer", label: "Pending customer" }].map((option) => (
                <button key={option.value} type="button" aria-pressed={filter === option.value} onClick={() => handleFilterChange(option.value)} className={cn("rounded-full border px-3 py-1.5 text-[10px] font-medium transition", filter === option.value ? "border-primary/20 bg-primary/8 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted")}>{option.label}</button>
              ))}
            </div>
          </div>

          {error && <div role="alert" className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</div>}
          {loading ? (
            <div className="rounded-lg border border-border/70 px-4 py-12 text-center text-xs text-muted-foreground">Loading tickets from PostgreSQL…</div>
          ) : tickets.length ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-muted/55 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-4 py-3">Ticket</th><th scope="col" className="px-4 py-3">Customer</th><th scope="col" className="px-4 py-3">Team / owner</th><th scope="col" className="px-4 py-3">Priority</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">SLA</th><th scope="col" className="px-4 py-3">Age</th><th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody className="divide-y divide-border/70">
                    {tickets.map((ticket) => (
                      <tr key={ticket.databaseId} className="bg-card transition-colors hover:bg-muted/25">
                        <td className="px-4 py-3.5"><button type="button" onClick={() => setSelectedTicket(ticket)} className="text-left"><span className="block font-semibold text-primary">{ticket.id}</span><span className="mt-1 block max-w-[250px] truncate text-[10px] text-foreground">{ticket.subject}</span></button></td>
                        <td className="px-4 py-3.5 text-foreground">{ticket.customer}</td>
                        <td className="px-4 py-3.5"><span className="block font-medium text-foreground">{ticket.queue}</span><span className="mt-1 block text-[10px] text-muted-foreground">{ticket.owner}</span></td>
                        <td className="px-4 py-3.5"><Badge variant={ticket.priority === "Critical" || ticket.priority === "High" ? "danger" : ticket.priority === "Normal" ? "warning" : "muted"}>{ticket.priority}</Badge></td>
                        <td className="px-4 py-3.5"><StatusBadge status={ticket.status} /></td>
                        <td className="px-4 py-3.5"><StatusBadge status={ticket.sla} /></td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{ticket.age}</td>
                        <td className="px-4 py-3.5"><Button size="sm" variant="ghost" onClick={() => setSelectedTicket(ticket)}>Review <ArrowRight data-icon="inline-end" aria-hidden="true" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>Showing <strong className="font-semibold text-foreground">{startRow.toLocaleString()}–{endRow.toLocaleString()}</strong> of <strong className="font-semibold text-foreground">{totalTickets.toLocaleString()}</strong> tickets</span>
                  <span className="hidden text-border sm:inline">·</span>
                  <label className="flex items-center gap-2">Rows per page<select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-primary/50"><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option><option value={200}>200</option></select></label>
                </div>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <span className="mr-2 text-[11px] text-muted-foreground">Page {page} of {pageCount.toLocaleString()}</span>
                  <Button size="sm" variant="outline" onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} disabled={page <= 1 || loading}><ChevronLeft data-icon="inline-start" aria-hidden="true" />Previous</Button>
                  <Button size="sm" variant="outline" onClick={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))} disabled={page >= pageCount || loading}>Next<ChevronRight data-icon="inline-end" aria-hidden="true" /></Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="No tickets found" description={query || filter !== "all" ? "Try a different search or status filter." : "No tickets are currently available in this workspace."} icon={Search} action={<Button size="sm" variant="outline" onClick={() => { handleQueryChange(""); handleFilterChange("all") }}>Clear filters</Button>} />
          )}
        </CardContent>
      </Card>
      <TicketDetails ticket={selectedTicket} onClear={() => setSelectedTicket(null)} />
    </div>
  )
}

function IssueClusterCard({ cluster, active, onSelect }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={active} className={cn("w-full rounded-xl border p-4 text-left transition", active ? "border-primary/30 bg-primary/[0.035] ring-1 ring-primary/10" : "border-border/70 bg-card hover:border-primary/20 hover:bg-muted/20")}>
      <div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-semibold text-foreground">{cluster.name}</span><span className={cn("shrink-0 text-[10px] font-semibold", cluster.change.startsWith("+") ? "text-destructive" : "text-positive")}>{cluster.change}</span></div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground"><span>{cluster.tickets.toLocaleString()} tickets</span><span>{cluster.confidence}% confidence</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, cluster.tickets / 13)}%` }} /></div>
      <div className="mt-3 flex items-center justify-between gap-2"><span className="text-[10px] text-muted-foreground">{cluster.team}</span><span className="text-[10px] font-semibold text-primary">{cluster.deflection}</span></div>
    </button>
  )
}

export function TicketIntelligencePage() {
  const [activeCluster, setActiveCluster] = useState(issueClusters[0])
  const [view, setView] = useState("clusters")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Customer signal analysis"
        title="Ticket intelligence"
        description="Turn ticket language and behavior into clear drivers, themes, and opportunities to reduce repeat demand."
        actions={<Link href="/dashboard/live-operations" className={cn(buttonVariants({ variant: "outline" }))}><Ticket data-icon="inline-start" aria-hidden="true" />View live tickets</Link>}
      />
      <section aria-label="Ticket intelligence metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Tickets analyzed" value="12,482" change="+8.4%" detail="across 30 days" icon={Ticket} tone="info" />
        <MetricTile label="Intent clusters" value="38" change="+6" detail="newly detected themes" icon={Boxes} tone="violet" />
        <MetricTile label="Top driver share" value="10.3%" change="1,284 tickets" detail="carrier scan delays" icon={PackageCheck} tone="warning" />
        <MetricTile label="Deflection potential" value="$99k" change="4 opportunities" detail="estimated monthly value" icon={Zap} tone="positive" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Top contact drivers</CardTitle><CardDescription className="mt-1">Highest-volume customer intent clusters</CardDescription></div><Badge variant="muted">30 days</Badge></CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driverChartData} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 4 }} barCategoryGap="28%">
                  <CartesianGrid horizontal={false} strokeDasharray="3 4" />
                  <XAxis type="number" axisLine={false} tickLine={false} tickMargin={8} tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`} />
                  <YAxis type="category" dataKey="driver" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip suffix=" tickets" />} />
                  <Bar dataKey="tickets" name="Tickets" radius={[0, 5, 5, 0]} maxBarSize={26} fill="var(--primary)" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><div><CardTitle>Intent landscape</CardTitle><CardDescription className="mt-1">Themes with the largest service impact</CardDescription></div><Badge variant="info">AI grouped</Badge></CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {issueClusters.slice(0, 3).map((cluster, index) => (
              <div key={cluster.name} className="flex items-center gap-3 rounded-lg border border-border/65 px-3 py-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-[10px] font-semibold text-primary">0{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-foreground">{cluster.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{cluster.driver}</p></div>
                <span className="shrink-0 text-right"><span className="block text-xs font-semibold tabular-nums text-foreground">{cluster.tickets.toLocaleString()}</span><span className="mt-1 block text-[9px] text-muted-foreground">tickets</span></span>
              </div>
            ))}
            <div className="mt-1 rounded-lg bg-primary/[0.045] p-3"><p className="text-[10px] font-semibold text-primary">Insight</p><p className="mt-1 text-[11px] leading-5 text-foreground">Delivery and billing themes account for 17% of this period&apos;s volume, with clear proactive messaging opportunities.</p></div>
          </CardContent>
        </Card>
      </section>
      <section aria-labelledby="cluster-explorer-title">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="cluster-explorer-title" className="text-sm font-semibold text-foreground">Root-cause explorer</h2><p className="mt-1 text-xs text-muted-foreground">Select a cluster to inspect evidence and business impact.</p></div>
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            {[{ value: "clusters", label: "Clusters" }, { value: "drivers", label: "Drivers" }].map((option) => <button key={option.value} type="button" aria-pressed={view === option.value} onClick={() => setView(option.value)} className={cn("rounded-md px-3 py-1.5 text-[10px] font-medium", view === option.value ? "bg-primary/8 text-primary" : "text-muted-foreground hover:text-foreground")}>{option.label}</button>)}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {issueClusters.map((cluster) => <IssueClusterCard key={cluster.name} cluster={cluster} active={activeCluster.name === cluster.name} onSelect={() => setActiveCluster(cluster)} />)}
          </div>
          <Card className="h-full">
            <CardHeader className="pb-3"><div><CardTitle>{view === "clusters" ? activeCluster.name : `${activeCluster.team} · driver details`}</CardTitle><CardDescription className="mt-1">{view === "clusters" ? "Evidence-backed customer issue cluster" : "Operational context and suggested investigation"}</CardDescription></div><Badge variant="success">{activeCluster.confidence}% confidence</Badge></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/60 p-3"><p className="text-[10px] text-muted-foreground">Ticket volume</p><p className="mt-1 text-lg font-semibold text-foreground">{activeCluster.tickets.toLocaleString()}</p></div>
                <div className="rounded-lg bg-muted/60 p-3"><p className="text-[10px] text-muted-foreground">Monthly impact</p><p className="mt-1 text-lg font-semibold text-foreground">{activeCluster.deflection}</p></div>
              </div>
              <div className="mt-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Likely root cause</p><p className="mt-1 text-sm font-medium text-foreground">{activeCluster.driver}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Customers are contacting support for updates when a key operational milestone is delayed or unclear. The cluster is concentrated in the {activeCluster.team} queue and shows a {activeCluster.change} change against the previous period.</p></div>
              <div className="mt-4 rounded-lg border border-primary/15 bg-primary/[0.035] p-3"><p className="text-[10px] font-semibold text-primary">Recommended investigation</p><p className="mt-1 text-xs leading-5 text-foreground">Review recent carrier handoffs and customer-facing status messages, then compare repeat-contact rate after a proactive update.</p></div>
              <Link href="/dashboard/recommendations" className={cn(buttonVariants({ variant: "default", size: "sm" }), "mt-4 w-full justify-center")}>Explore recommended actions <ArrowRight data-icon="inline-end" aria-hidden="true" /></Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
