"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Activity,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LineChart,
  Menu,
  Search,
  Settings2,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const DashboardContext = createContext({ period: "30d", setPeriod: () => {} })

export function useDashboard() {
  return useContext(DashboardContext)
}

const navigationGroups = [
  {
    label: "Workspace",
    links: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Live operations", href: "/dashboard/live-operations", icon: Activity, indicator: "live" },
      { label: "Ticket intelligence", href: "/dashboard/ticket-intelligence", icon: ClipboardList },
    ],
  },
  {
    label: "Analytics",
    links: [
      { label: "Predictive analytics", href: "/dashboard/predictive-analytics", icon: BrainCircuit },
      { label: "Historical analytics", href: "/dashboard/historical-analytics", icon: LineChart },
    ],
  },
  {
    label: "Decision support",
    links: [
      { label: "Recommendations", href: "/dashboard/recommendations", icon: Sparkles, count: "4" },
      { label: "Workload optimization", href: "/dashboard/workload-optimization", icon: Users },
      { label: "What-if simulation", href: "/dashboard/simulations", icon: Target },
      { label: "Interventions & outcomes", href: "/dashboard/outcomes", icon: ArrowUpRight },
    ],
  },
  {
    label: "Platform",
    links: [
      { label: "Model & data health", href: "/dashboard/model-health", icon: Gauge },
    ],
  },
]

const searchableItems = [
  { type: "Ticket", title: "TK-4821 · Delivery status and carrier handoff", description: "1,284 related tickets · +18% this week", href: "/dashboard/ticket-intelligence" },
  { type: "Queue", title: "Billing queue · 312 tickets at risk", description: "94% utilization · next 3 weekdays", href: "/dashboard/live-operations" },
  { type: "Team", title: "Logistics team workload", description: "24 active agents · 88% utilization", href: "/dashboard/workload-optimization" },
  { type: "Insight", title: "Proactive delivery updates", description: "$42k monthly deflection opportunity", href: "/dashboard/recommendations" },
  { type: "Model", title: "SLA risk forecast", description: "Model v2.8 · 93.4% confidence", href: "/dashboard/predictive-analytics" },
  { type: "Source", title: "Carrier event stream", description: "Last sync 11 minutes ago", href: "/dashboard/model-health" },
]

function SidebarLink({ item, pathname, collapsed, onNavigate, mobile = false }) {
  const Icon = item.icon
  const isActive = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      aria-label={item.label}
      title={collapsed && !mobile ? item.label : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors",
        isActive
          ? "bg-primary/8 text-primary shadow-[inset_2px_0_0_var(--primary)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && !mobile && "justify-center px-0",
      )}
    >
      <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.8} />
      {(!collapsed || mobile) && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
      {item.indicator === "live" && (!collapsed || mobile) && <span className="size-1.5 rounded-full bg-positive" aria-label="Live" />}
      {item.count && (!collapsed || mobile) && (
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{item.count}</span>
      )}
      {collapsed && !mobile && (
        <span aria-hidden="true" className="pointer-events-none absolute left-[calc(100%+10px)] z-40 hidden whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg group-hover:block group-focus-visible:block">
          {item.label}
        </span>
      )}
    </Link>
  )
}

function WorkspaceSwitcher({ workspace, setWorkspace, collapsed }) {
  const [open, setOpen] = useState(false)
  const workspaces = ["Northstar Support", "Atlas Customer Care"]

  return (
    <div className="relative px-3 pb-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Switch workspace"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-border/70 bg-muted/40 p-2 text-left transition-colors hover:bg-muted",
          collapsed && "justify-center px-1.5",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-[10px] font-bold tracking-wide text-primary">NS</span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-foreground">{workspace}</span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">Enterprise workspace</span>
            </span>
            <ChevronDown aria-hidden="true" className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </>
        )}
      </button>
      {open && (
        <div role="listbox" aria-label="Choose a workspace" className={cn("absolute left-3 right-3 top-full z-50 mt-2 rounded-xl border border-border bg-popover p-1.5 shadow-xl", collapsed && "left-16 right-auto w-56")}>
          {workspaces.map((name) => (
            <button
              key={name}
              type="button"
              role="option"
              aria-selected={workspace === name}
              onClick={() => { setWorkspace(name); setOpen(false) }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-foreground hover:bg-muted"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-[9px] font-bold text-primary">{name === "Northstar Support" ? "NS" : "AC"}</span>
              <span className="min-w-0 flex-1 truncate">{name}</span>
              {workspace === name && <Check aria-hidden="true" className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Sidebar({ collapsed, onToggleCollapse, mobile = false, onNavigate, workspace, setWorkspace, pathname, onClose }) {
  return (
    <aside className={cn(
      "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
      mobile ? "w-[284px] max-w-[calc(100vw-48px)]" : "sticky top-0 hidden h-screen shrink-0 md:flex",
      !mobile && (collapsed ? "w-[76px]" : "w-[252px]"),
    )}>
      <div className={cn("flex h-[68px] shrink-0 items-center px-4", collapsed && !mobile && "justify-center px-0")}>
        <Link href="/dashboard" onClick={onNavigate} aria-label="OpsPilot AI overview" className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20">
            <Activity aria-hidden="true" className="size-[19px]" strokeWidth={2.2} />
          </span>
          {(!collapsed || mobile) && (
            <span className="min-w-0">
              <span className="block text-[15px] font-bold tracking-tight text-foreground">OpsPilot<span className="text-primary"> AI</span></span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Operations intelligence</span>
            </span>
          )}
        </Link>
        {mobile && (
          <Button aria-label="Close navigation" variant="ghost" size="icon-sm" className="ml-auto" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        )}
      </div>

      <WorkspaceSwitcher workspace={workspace} setWorkspace={setWorkspace} collapsed={collapsed && !mobile} />

      <nav aria-label="Primary navigation" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {(!collapsed || mobile) ? (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">{group.label}</p>
            ) : (
              <span className="sr-only">{group.label}</span>
            )}
            <div className="flex flex-col gap-1">
              {group.links.map((item) => (
                <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} mobile={mobile} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-sidebar-border px-3 py-3">
        <SidebarLink
          item={{ label: "Settings", href: "/dashboard/settings", icon: Settings2 }}
          pathname={pathname}
          collapsed={collapsed}
          mobile={mobile}
          onNavigate={onNavigate}
        />
        <Link href="/dashboard/model-health" onClick={onNavigate} className={cn("mt-3 flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-muted", collapsed && !mobile && "justify-center px-0")}>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">JL</span>
          {(!collapsed || mobile) && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold text-foreground">Jordan Lee</span>
              <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">Operations admin</span>
            </span>
          )}
          {(!collapsed || mobile) && <ChevronsLeft aria-hidden="true" className="size-3.5 rotate-180 text-muted-foreground" />}
        </Link>
        {(!collapsed || mobile) && <p className="px-2.5 pt-2 text-[10px] text-muted-foreground/75">OpsPilot AI · 2026</p>}
        {!mobile && (
          <Button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            variant="ghost"
            size="icon-sm"
            className={cn("absolute -right-3.5 top-[76px] hidden size-7 rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground md:flex", collapsed && "rotate-180")}
            onClick={onToggleCollapse}
          >
            <ChevronsRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </aside>
  )
}

function SearchBox({ className }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", focusSearch)
    return () => window.removeEventListener("keydown", focusSearch)
  }, [])
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return searchableItems.filter((item) => `${item.type} ${item.title} ${item.description}`.toLowerCase().includes(normalized)).slice(0, 5)
  }, [query])

  function navigateToResult(href) {
    setQuery("")
    router.push(href)
  }

  return (
    <div className={cn("relative", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229 && results[0]) {
            navigateToResult(results[0].href)
          }
          if (event.key === "Escape") setQuery("")
        }}
        role="combobox"
        aria-label="Search tickets, teams, and insights"
        aria-expanded={query.length > 0}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        placeholder="Search tickets, teams, insights..."
        className="h-9 w-full rounded-lg border border-border/80 bg-muted/50 pl-9 pr-10 text-xs text-foreground outline-none transition focus:border-primary/40 focus:bg-card focus:ring-2 focus:ring-primary/10"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground xl:inline-flex">⌘ K</kbd>
      {query.length > 0 && (
        <div id="global-search-results" role="listbox" aria-label="Search results" className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          {results.length > 0 ? results.map((item) => (
            <button
              key={item.title}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => navigateToResult(item.href)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted"
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary"><Search aria-hidden="true" className="size-3.5" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-xs font-medium text-foreground"><span className="truncate">{item.title}</span><span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{item.type}</span></span>
                <span className="mt-1 block truncate text-[11px] text-muted-foreground">{item.description}</span>
              </span>
            </button>
          )) : (
            <p role="status" className="px-3 py-4 text-center text-xs text-muted-foreground">No matching records found.</p>
          )}
        </div>
      )}
    </div>
  )
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(3)
  const notifications = [
    { label: "Billing queue is nearing its SLA threshold", time: "8 min ago", tone: "warning" },
    { label: "Forecast refreshed with new carrier events", time: "38 min ago", tone: "info" },
    { label: "Delivery delay recommendation is ready", time: "1 hr ago", tone: "positive" },
  ]

  return (
    <div className="relative">
      <Button aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} className="relative text-muted-foreground hover:text-foreground">
        <Bell aria-hidden="true" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-background bg-destructive" />}
      </Button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(340px,calc(100vw-32px))] rounded-xl border border-border bg-popover p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-semibold text-foreground">Notifications</p><p className="mt-0.5 text-[11px] text-muted-foreground">Your latest operations updates</p></div>
            {unread > 0 && <Badge variant="default">{unread} new</Badge>}
          </div>
          <div className="my-3 h-px bg-border" />
          <div className="flex flex-col gap-1">
            {notifications.map((notification) => (
              <div key={notification.label} className="flex gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/70">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", notification.tone === "warning" ? "bg-warning" : notification.tone === "info" ? "bg-info" : "bg-positive")} />
                <div className="min-w-0"><p className="text-xs leading-5 text-foreground">{notification.label}</p><p className="mt-1 text-[10px] text-muted-foreground">{notification.time}</p></div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full text-xs text-primary" onClick={() => setUnread(0)}>
            <Check data-icon="inline-start" aria-hidden="true" /> Mark all as read
          </Button>
        </div>
      )}
    </div>
  )
}

function AccountMenu({ onFeedback }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button aria-label="Open account menu" aria-expanded={open} variant="ghost" size="icon" className="rounded-full p-0" onClick={() => setOpen((value) => !value)}>
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">JL</span>
      </Button>
      {open && (
        <div role="menu" aria-label="Account menu" className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          <div className="px-3 py-2.5"><p className="text-xs font-semibold text-foreground">Jordan Lee</p><p className="mt-0.5 text-[10px] text-muted-foreground">jordan.lee@northstar.example</p></div>
          <div className="my-1 h-px bg-border" />
          <button role="menuitem" type="button" onClick={() => { setOpen(false); router.push("/dashboard/settings") }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-foreground hover:bg-muted"><Settings2 aria-hidden="true" className="size-4 text-muted-foreground" />Profile and settings</button>
          <button role="menuitem" type="button" onClick={() => { setOpen(false); onFeedback("You are viewing the Northstar demo workspace.") }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-foreground hover:bg-muted"><CircleHelp aria-hidden="true" className="size-4 text-muted-foreground" />Help and support</button>
          <div className="my-1 h-px bg-border" />
          <button role="menuitem" type="button" onClick={() => { setOpen(false); onFeedback("Demo mode is active, so no sign-out is required.") }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted">Sign out</button>
        </div>
      )}
    </div>
  )
}

export function DashboardShell({ children }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [period, setPeriod] = useState("30d")
  const [workspace, setWorkspace] = useState("Northstar Support")
  const [feedback, setFeedback] = useState("")

  const activeLink = navigationGroups.flatMap((group) => group.links).find((item) => item.href === pathname) ?? {
    label: pathname === "/dashboard/settings" ? "Settings" : "Overview",
    href: "/dashboard",
  }

  useEffect(() => {
    if (!mobileOpen) return undefined
    function onKeyDown(event) {
      if (event.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  useEffect(() => {
    if (!feedback) return undefined
    const timeout = window.setTimeout(() => setFeedback(""), 3600)
    return () => window.clearTimeout(timeout)
  }, [feedback])

  return (
    <DashboardContext.Provider value={{ period, setPeriod, workspace }}>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          pathname={pathname}
          workspace={workspace}
          setWorkspace={setWorkspace}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur">
            <div className="flex min-h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Button aria-label="Open navigation" variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => setMobileOpen(true)}>
                <Menu aria-hidden="true" />
              </Button>
              <nav aria-label="Breadcrumb" className="hidden min-w-[180px] items-center gap-2 text-xs sm:flex">
                <span className="text-muted-foreground">Operations</span>
                <span aria-hidden="true" className="text-border">/</span>
                <span aria-current="page" className="font-semibold text-foreground">{activeLink.label}</span>
              </nav>
              <div className="hidden min-w-0 flex-1 lg:block"><SearchBox className="mx-auto max-w-[390px]" /></div>
              <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
                <label className="sr-only" htmlFor="global-period">Reporting period</label>
                <select
                  id="global-period"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="hidden h-9 min-w-[130px] rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 sm:block"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <div className="hidden items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1.5 text-[10px] font-medium text-warning-foreground xl:flex">
                  <span className="relative flex size-1.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-40" /><span className="relative inline-flex size-1.5 rounded-full bg-warning" /></span>
                  1 source delayed
                </div>
                <NotificationsMenu />
                <div className="h-7 w-px bg-border/80" />
                <AccountMenu onFeedback={setFeedback} />
              </div>
            </div>
            <div className="px-4 pb-3 lg:hidden sm:px-6">
              <SearchBox />
              <div className="mt-2 flex items-center justify-between gap-2 sm:hidden">
                <label className="sr-only" htmlFor="mobile-period">Reporting period</label>
                <select
                  id="mobile-period"
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="h-8 min-w-[126px] rounded-lg border border-border/80 bg-card px-2.5 text-[11px] font-medium text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1.5 text-[10px] font-medium text-warning-foreground" role="status">
                  <span className="size-1.5 rounded-full bg-warning" />
                  1 source delayed
                </div>
              </div>
            </div>
          </header>
          <main id="main-content" className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-[1600px] px-4 pb-12 pt-7 sm:px-6 sm:pt-8 lg:px-8 lg:pt-9">
              {children}
            </div>
          </main>
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 cursor-pointer bg-slate-950/35" />
            <div role="dialog" aria-modal="true" aria-label="Navigation menu" className="absolute inset-y-0 left-0 shadow-2xl">
              <Sidebar
                collapsed={false}
                mobile
                pathname={pathname}
                workspace={workspace}
                setWorkspace={setWorkspace}
                onNavigate={() => setMobileOpen(false)}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </div>
        )}
        {feedback && (
          <div role="status" className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs font-medium text-foreground shadow-xl">
            <Check aria-hidden="true" className="size-4 text-positive" />{feedback}
          </div>
        )}
      </div>
    </DashboardContext.Provider>
  )
}
