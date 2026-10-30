"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Cpu,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog, MetricTile, PageHeader } from "@/components/dashboard/section-shared"
import { apiPost } from "@/lib/api"
import { cn } from "@/lib/utils"

const WORKSPACE_ID = (process.env.NEXT_PUBLIC_WORKSPACE_ID || "").trim()

const numberFormat = new Intl.NumberFormat("en-IN")

function formatNumber(value) {
  return numberFormat.format(Number(value || 0))
}

function formatMinutes(value) {
  const minutes = Math.max(0, Number(value || 0))
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = minutes / 60
  if (hours < 24) return `${hours.toFixed(1)} hrs`
  return `${(hours / 24).toFixed(1)} days`
}

function percentTone(value) {
  if (value >= 200) return "danger"
  if (value >= 100) return "warning"
  return "positive"
}

function statusBadge(status) {
  if (status === "open") return <Badge variant="info">Open</Badge>
  if (status === "in_progress") return <Badge variant="warning">In progress · review</Badge>
  if (status === "pending_customer") return <Badge variant="muted">Pending customer · review</Badge>
  return <Badge variant="muted">{status || "Unknown"}</Badge>
}

function priorityBadge(priority) {
  const value = String(priority || "normal").toLowerCase()
  const variant = value === "critical" ? "danger" : value === "high" ? "warning" : value === "normal" ? "info" : "muted"
  return <Badge variant={variant}>{value}</Badge>
}

function TeamComparison({ before = [], after = [], planningHorizonHours = 24 }) {
  const afterById = new Map(after.map((team) => [team.team_id ?? "unassigned", team]))
  const rows = before.map((team) => ({
    key: team.team_id ?? "unassigned",
    name: team.team_name,
    beforeCount: team.active_tickets ?? 0,
    beforeMinutes: team.estimated_backlog_minutes ?? 0,
    capacity: team.planning_capacity_minutes,
    beforePct: team.backlog_vs_planning_capacity_pct,
    after: afterById.get(team.team_id ?? "unassigned"),
  }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div>
          <CardTitle>Team workload · before vs. after</CardTitle>
          <CardDescription className="mt-1">Projected backlog compared with the selected planning horizon. This is not live agent utilization.</CardDescription>
        </div>
        <Badge variant="info">{planningHorizonHours}h planning basis</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[minmax(110px,1fr)_70px_70px_minmax(100px,1fr)] gap-3 border-b border-border/70 pb-3 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[minmax(145px,1fr)_90px_90px_minmax(140px,1.1fr)]">
          <span>Team</span><span className="text-right">Before</span><span className="text-right">After</span><span>Backlog / capacity</span>
        </div>
        <div className="divide-y divide-border/60">
          {rows.map((row) => {
            const afterCount = row.after?.projected_active_tickets ?? row.beforeCount
            const afterMinutes = row.after?.projected_estimated_backlog_minutes ?? row.beforeMinutes
            const afterPct = row.after?.projected_backlog_vs_planning_capacity_pct ?? row.beforePct
            const tone = percentTone(afterPct || 0)
            const color = tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-positive"
            return (
              <div key={row.key} className="grid grid-cols-[minmax(110px,1fr)_70px_70px_minmax(100px,1fr)] items-center gap-3 py-3.5 text-xs sm:grid-cols-[minmax(145px,1fr)_90px_90px_minmax(140px,1.1fr)]">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{row.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{formatMinutes(afterMinutes)} projected work</p>
                </div>
                <span className="text-right tabular-nums text-muted-foreground">{formatNumber(row.beforeCount)}</span>
                <span className="text-right tabular-nums font-semibold text-foreground">{formatNumber(afterCount)}</span>
                <div>
                  <div className="mb-1 flex justify-between gap-2 text-[10px]">
                    <span className="font-semibold text-foreground">{afterPct == null ? "—" : `${Number(afterPct).toFixed(1)}%`}</span>
                    <span className="text-muted-foreground">{row.capacity ? `${formatNumber(row.capacity)} min cap.` : "No capacity"}</span>
                  </div>
                  {afterPct != null && <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(100, Math.max(0, Number(afterPct)))}%` }} /></div>}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span><strong className="text-positive">Below 100%</strong> · estimated work fits within one planning window</span>
          <span><strong className="text-warning">100–199%</strong> · exceeds one window</span>
          <span><strong className="text-destructive">200%+</strong> · substantial backlog pressure</span>
        </div>
      </CardContent>
    </Card>
  )
}

function AllocationTable({ allocations, selectedIds, setSelectedIds, filter, setFilter, applied }) {
  const visible = allocations.filter((item) => filter === "all" || item.status === filter)
  const toggle = (ticketId) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(ticketId)) next.delete(ticketId)
      else next.add(ticketId)
      return next
    })
  }

  return (
    <Card>
      <CardHeader className="gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Recommended team allocations</CardTitle>
          <CardDescription className="mt-1">Select the changes you want to approve. Existing assignments are not changed until you apply them.</CardDescription>
        </div>
        <Badge variant="warning">Manager review required</Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/35 p-1">
            {[{ id: "all", label: "All" }, { id: "open", label: "Open" }, { id: "in_progress", label: "In progress" }, { id: "pending_customer", label: "Pending customer" }].map((item) => (
              <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={cn("rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors", filter === item.id ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground")}>{item.label}</button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{selectedIds.size} selected · {visible.length} shown</span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/70">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="bg-muted/55 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr><th className="w-10 px-3 py-3"><span className="sr-only">Select</span></th><th className="px-3 py-3">Ticket</th><th className="px-3 py-3">Priority / status</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Recommended team</th><th className="px-3 py-3 text-right">Est. work</th><th className="px-3 py-3">Reason</th></tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {visible.map((item) => {
                const noChange = item.from_team_id === item.to_team_id
                const selected = selectedIds.has(item.ticket_id)
                const needsReview = item.status !== "open"
                return (
                  <tr key={item.ticket_id} className={cn("bg-card transition-colors", selected && "bg-primary/[0.035]")}>
                    <td className="px-3 py-3.5 align-top">
                      <input type="checkbox" aria-label={`Select ${item.external_id}`} checked={selected} disabled={applied || noChange} onChange={() => toggle(item.ticket_id)} className="mt-1 size-4 rounded border-border accent-[var(--primary)]" />
                    </td>
                    <td className="max-w-[250px] px-3 py-3.5 align-top">
                      <p className="font-semibold text-foreground">{item.external_id}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">{item.subject}</p>
                      {needsReview && <p className="mt-1 text-[9px] font-medium text-warning">Review existing workflow before assignment</p>}
                    </td>
                    <td className="px-3 py-3.5 align-top"><div className="flex flex-col items-start gap-1.5">{priorityBadge(item.priority)}{statusBadge(item.status)}</div></td>
                    <td className="px-3 py-3.5 align-top"><p className="font-medium text-foreground">{item.category}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.subcategory || "—"}</p></td>
                    <td className="px-3 py-3.5 align-top">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="max-w-[100px] truncate">{item.from_team_name || "Unassigned"}</span><ArrowRight className="size-3 shrink-0" /><span className="max-w-[140px] truncate font-semibold text-primary">{item.to_team_name}</span></div>
                    </td>
                    <td className="px-3 py-3.5 text-right align-top tabular-nums text-foreground">{formatMinutes(item.estimated_handling_minutes)}</td>
                    <td className="max-w-[190px] px-3 py-3.5 align-top text-[10px] leading-4 text-muted-foreground">{String(item.recommendation_reason || "Optimized team fit").replaceAll("_", " ")}</td>
                  </tr>
                )
              })}
              {visible.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">No allocations in this filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[10px] leading-5 text-muted-foreground">Open tickets are selected by default. In-progress and pending-customer tickets are left unchecked because they may already be partway through a support workflow. Review them individually before selecting.</p>
      </CardContent>
    </Card>
  )
}

export function WorkloadOptimizationPage() {
  const [planningHorizonHours, setPlanningHorizonHours] = useState(24)
  const [allowReassignment, setAllowReassignment] = useState(false)
  const [preview, setPreview] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [appliedResult, setAppliedResult] = useState(null)
  const [confirmApply, setConfirmApply] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [filter, setFilter] = useState("all")

  const allocations = preview?.allocations ?? []
  const selectedAllocations = useMemo(() => allocations.filter((item) => selectedIds.has(item.ticket_id) && item.from_team_id !== item.to_team_id), [allocations, selectedIds])
  const openCount = allocations.filter((item) => item.status === "open" && item.from_team_id !== item.to_team_id).length
  const reviewCount = allocations.filter((item) => item.status !== "open" && item.from_team_id !== item.to_team_id).length

  async function generatePreview() {
    if (!WORKSPACE_ID) {
      setError("NEXT_PUBLIC_WORKSPACE_ID is missing from .env.local. Add your workspace ID and restart Next.js.")
      return
    }
    setLoading(true)
    setError("")
    setNotice("")
    setAppliedResult(null)
    try {
      const result = await apiPost("/workload-optimization/solve", {
        workspace_id: WORKSPACE_ID,
        planning_horizon_hours: Number(planningHorizonHours),
        include_unassigned: true,
        allow_reassignment: allowReassignment,
        default_estimate_minutes: 30,
        max_solve_seconds: 8,
      })
      setPreview(result)
      // Only open, newly unassigned tickets are preselected. Other workflow states need explicit review.
      setSelectedIds(new Set((result.allocations || []).filter((item) => item.status === "open" && item.from_team_id !== item.to_team_id).map((item) => item.ticket_id)))
      setFilter("all")
    } catch (requestError) {
      setError(requestError.message || "Could not generate an optimization preview.")
      setPreview(null)
      setSelectedIds(new Set())
    } finally {
      setLoading(false)
    }
  }

  async function applySelected() {
    if (!preview || selectedAllocations.length === 0) return
    if (!WORKSPACE_ID) {
      setError("Workspace ID is missing. Check your .env.local configuration.")
      return
    }
    setApplying(true)
    setError("")
    setNotice("")
    try {
      const result = await apiPost("/workload-optimization/apply", {
        workspace_id: WORKSPACE_ID,
        optimization_id: preview.optimization_id,
        allocations: selectedAllocations.map((item) => ({
          ticket_id: item.ticket_id,
          expected_from_team_id: item.from_team_id || null,
          to_team_id: item.to_team_id,
        })),
      })
      setAppliedResult(result)
      setNotice(`${result.applied_count} team assignment${result.applied_count === 1 ? "" : "s"} applied and recorded in ticket history.`)
      setSelectedIds(new Set())
    } catch (requestError) {
      setError(requestError.message || "Could not apply selected assignments. The preview may be stale; generate a new one and retry.")
    } finally {
      setApplying(false)
    }
  }

  const before = preview?.before ?? []
  const after = preview?.after ?? []
  const summary = preview?.summary ?? {}
  const solverOptimal = preview?.solver_status === "OPTIMAL"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Decision support · team-level optimization"
        title="Workload optimization"
        description="Balance unassigned ticket work across qualified teams using OR-Tools. Review every proposed change before it reaches the ticket database."
        actions={<Badge variant="info"><Cpu data-icon="inline-start" aria-hidden="true" />OR-Tools CP-SAT</Badge>}
      />

      <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] via-card to-card">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/12 text-primary"><WandSparkles className="size-4" /></span><p className="text-xs font-semibold text-foreground">Generate an allocation preview</p></div>
            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">The solver evaluates team capacity, category eligibility, ticket priority and SLA deadline state. Generating a preview is read-only; no ticket is reassigned automatically.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-[10px] font-medium text-muted-foreground">Planning horizon
              <select value={planningHorizonHours} onChange={(event) => setPlanningHorizonHours(Number(event.target.value))} disabled={loading || applying} className="h-9 min-w-32 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring">
                <option value={8}>Next 8 hours</option><option value={24}>Next 24 hours</option><option value={48}>Next 48 hours</option><option value={72}>Next 72 hours</option>
              </select>
            </label>
            <label className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-[10px] text-muted-foreground">
              <input type="checkbox" checked={allowReassignment} onChange={(event) => setAllowReassignment(event.target.checked)} disabled={loading || applying} className="size-3.5 accent-[var(--primary)]" />
              Allow untouched open-ticket reassignments
            </label>
            <Button onClick={generatePreview} disabled={loading || applying}>
              {loading ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Sparkles data-icon="inline-start" />}
              {loading ? "Optimizing…" : "Generate optimization"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/8 p-4 text-xs text-foreground"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" /><div className="min-w-0"><p className="font-semibold">Optimization request failed</p><p className="mt-1 leading-5 text-muted-foreground">{error}</p></div><button type="button" onClick={() => setError("")} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Dismiss error"><X className="size-4" /></button></div>}
      {notice && <div role="status" className="flex items-center gap-2 rounded-xl border border-positive/20 bg-positive/8 px-4 py-3 text-xs text-foreground"><CheckCircle2 className="size-4 text-positive" />{notice}</div>}

      {!preview && !loading && (
        <Card>
          <CardContent className="flex min-h-[270px] flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SlidersHorizontal className="size-5" /></span>
            <h2 className="text-sm font-semibold text-foreground">Ready to optimize team workload</h2>
            <p className="mt-2 max-w-lg text-xs leading-5 text-muted-foreground">Generate a fresh preview to see how unassigned tickets could be distributed across eligible teams. Open tickets will be preselected; in-progress and pending-customer tickets require an explicit review.</p>
            <Button className="mt-5" onClick={generatePreview}><Sparkles data-icon="inline-start" />Generate optimization</Button>
          </CardContent>
        </Card>
      )}

      {preview && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2"><Badge variant={solverOptimal ? "success" : "warning"}>{preview.solver_status || "Solver completed"}</Badge><Badge variant="muted">{preview.solver || "Optimization solver"}</Badge><span className="text-[10px] text-muted-foreground">Solved in {Number(preview.solve_seconds || 0).toFixed(3)}s · {preview.planning_horizon_hours}h horizon</span></div>
            <Button size="sm" variant="outline" onClick={generatePreview} disabled={loading || applying}><RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : ""} />Regenerate preview</Button>
          </div>

          <section aria-label="Optimization summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile label="Active workspace tickets" value={formatNumber(summary.active_tickets_in_workspace)} detail="Current unresolved queue" icon={Users} tone="info" />
            <MetricTile label="Candidate tickets" value={formatNumber(summary.candidate_tickets)} detail="Included in this solve" icon={SlidersHorizontal} tone="violet" />
            <MetricTile label="Proposed assignments" value={formatNumber(summary.recommended_allocations)} detail={`${formatNumber(summary.team_assignment_changes)} team changes`} icon={ArrowRight} tone="positive" />
            <MetricTile label="Unassigned after preview" value={formatNumber(summary.unassigned_after_optimization)} detail={`${formatNumber(summary.tickets_using_estimate_fallback)} estimated via fallback`} icon={ShieldAlert} tone={summary.unassigned_after_optimization > 0 ? "warning" : "positive"} />
          </section>

          <TeamComparison before={before} after={after} planningHorizonHours={preview.planning_horizon_hours} />

          <Card className="border-warning/20 bg-warning/[0.035]">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <div>
                <p className="text-xs font-semibold text-foreground">Review active-workflow tickets carefully</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{formatNumber(reviewCount)} recommendations are for tickets already marked in progress or pending customer. They are not preselected. Confirm the ticket history and operational ownership before selecting them. {formatNumber(openCount)} open tickets are preselected for a safer first approval.</p>
              </div>
            </CardContent>
          </Card>

          {allocations.length > 0 ? (
            <AllocationTable allocations={allocations} selectedIds={selectedIds} setSelectedIds={setSelectedIds} filter={filter} setFilter={setFilter} applied={Boolean(appliedResult)} />
          ) : (
            <Card><CardContent className="p-8 text-center"><Badge variant="success">No allocation changes needed</Badge><p className="mt-2 text-xs text-muted-foreground">The solver did not return any team assignment changes for the current inputs.</p></CardContent></Card>
          )}

          <Card className="border-primary/15">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">Manager approval</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{appliedResult ? `${formatNumber(appliedResult.applied_count)} assignments were applied for this preview.` : `${formatNumber(selectedAllocations.length)} selected changes will be validated against current ticket assignments, team activity and category eligibility before being saved.`}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set(allocations.filter((item) => item.status === "open" && item.from_team_id !== item.to_team_id).map((item) => item.ticket_id)))} disabled={Boolean(appliedResult) || applying}>Select open only</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} disabled={Boolean(appliedResult) || applying}>Clear selection</Button>
                <Button size="sm" onClick={() => setConfirmApply(true)} disabled={applying || loading || Boolean(appliedResult) || selectedAllocations.length === 0}>
                  {applying ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
                  {applying ? "Applying…" : `Apply ${selectedAllocations.length} selected`}
                </Button>
              </div>
            </CardContent>
          </Card>

          <ConfirmationDialog
            open={confirmApply}
            onClose={() => setConfirmApply(false)}
            onConfirm={() => { setConfirmApply(false); applySelected() }}
            title={`Apply ${selectedAllocations.length} team assignment${selectedAllocations.length === 1 ? "" : "s"}?`}
            description="Selected tickets will be assigned to the recommended teams. The backend will revalidate each ticket's current team and category eligibility, update the ticket, and write an audit event. In-progress and pending-customer tickets are included only if you explicitly selected them."
            confirmLabel="Approve and apply assignments"
          />

          {appliedResult && (
            <Card className="border-positive/20 bg-positive/[0.035]">
              <CardContent className="flex items-start gap-3 p-4">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-positive" />
                <div className="min-w-0"><p className="text-xs font-semibold text-foreground">Assignments successfully applied</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{appliedResult.message} Optimization ID: <span className="font-mono">{appliedResult.optimization_id}</span></p><Button size="sm" variant="outline" className="mt-3" onClick={generatePreview}>Generate a fresh preview <ArrowRight data-icon="inline-end" /></Button></div>
              </CardContent>
            </Card>
          )}

          {Array.isArray(preview.warnings) && preview.warnings.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs">Optimization notes and assumptions</CardTitle></CardHeader>
              <CardContent><ul className="grid gap-2 sm:grid-cols-2">{preview.warnings.map((warning, index) => <li key={`${index}-${warning}`} className="flex items-start gap-2 text-[10px] leading-5 text-muted-foreground"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/70" />{warning}</li>)}</ul></CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
