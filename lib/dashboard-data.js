function makeDailyOperationsData() {
  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 9, 28))
    date.setUTCDate(date.getUTCDate() - (89 - index))
    const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    const wave = Math.sin(index * 0.62)
    const weekendAdjustment = [0, 6].includes(date.getUTCDay()) ? -74 : 0
    const incoming = Math.round(815 + wave * 82 + (index % 5) * 16 + weekendAdjustment)
    const resolved = Math.round(incoming * (0.92 + Math.cos(index * 0.34) * 0.045))
    const breached = Math.max(3, Math.round(8 + Math.sin(index * 0.38) * 2.5 + (index > 22 ? 1 : 0)))

    return {
      day,
      incoming,
      resolved,
      open: Math.round(1050 + Math.cos(index * 0.27) * 96 + index * 4),
      slaMet: 100 - breached,
      slaBreached: breached,
    }
  })
}

export const dailyOperationsData = makeDailyOperationsData()

export const priorityInsights = [
  {
    id: "insight-1",
    priority: "High",
    title: "Delivery delays are driving repeat contacts",
    evidence: "1,284 delivery-status tickets in 7 days, up 18% week over week",
    impact: "$42k monthly deflection opportunity",
    team: "Logistics",
    nextStep: "Send proactive delay updates before customers reach support.",
    ticket: "TK-4821",
  },
  {
    id: "insight-2",
    priority: "High",
    title: "Billing queue is at risk of missing SLA",
    evidence: "Queue utilization reached 94% during the 10am–1pm peak",
    impact: "312 tickets at risk this week",
    team: "Billing",
    nextStep: "Move two flex agents into the midday billing rotation.",
    ticket: "TK-4798",
  },
  {
    id: "insight-3",
    priority: "Medium",
    title: "Password reset friction increased after release 4.8",
    evidence: "Authentication tickets rose 11% across web and mobile",
    impact: "6.4 hours of avoidable handle time per day",
    team: "Product support",
    nextStep: "Review the updated reset flow and add an in-product recovery path.",
    ticket: "TK-4752",
  },
  {
    id: "insight-4",
    priority: "Medium",
    title: "Weekend coverage is under target for returns",
    evidence: "Saturday coverage is 16 points below the weekday baseline",
    impact: "SLA exposure across 86 open return requests",
    team: "Returns",
    nextStep: "Pilot a rotating weekend shift for the next two weeks.",
    ticket: "TK-4701",
  },
]

export const healthScorecard = [
  { label: "Support", score: 92, note: "Strong performance", tone: "positive" },
  { label: "Fulfillment", score: 81, note: "Watch closely", tone: "warning" },
  { label: "Delivery", score: 76, note: "Needs attention", tone: "danger" },
  { label: "Tech ops", score: 89, note: "On track", tone: "info" },
]

export const recentActivity = [
  { id: "activity-1", type: "recommendation", title: "Coverage change approved", detail: "Billing queue · 2 flex agents", time: "12 min ago", initials: "JL" },
  { id: "activity-2", type: "model", title: "Forecast refreshed", detail: "SLA risk model · 30-day horizon", time: "38 min ago", initials: "AI" },
  { id: "activity-3", type: "data", title: "Zendesk sync completed", detail: "2,406 records processed", time: "1 hr ago", initials: "SY" },
  { id: "activity-4", type: "alert", title: "Delivery risk acknowledged", detail: "Owner assigned · Logistics team", time: "2 hr ago", initials: "MK" },
]

export const liveTickets = [
  { id: "TK-4821", subject: "Package marked delivered but not received", customer: "Maya Patel", queue: "Delivery", owner: "A. Rivera", priority: "High", age: "3h 42m", sla: "At risk", status: "Open" },
  { id: "TK-4818", subject: "Refund status has not updated", customer: "Ethan Brooks", queue: "Billing", owner: "J. Kim", priority: "High", age: "2h 18m", sla: "At risk", status: "Open" },
  { id: "TK-4812", subject: "Cannot reset password on mobile app", customer: "Leila Hassan", queue: "Account access", owner: "S. Chen", priority: "Medium", age: "1h 06m", sla: "On track", status: "In progress" },
  { id: "TK-4809", subject: "Return label shows an expired date", customer: "Noah Williams", queue: "Returns", owner: "M. Ortiz", priority: "Medium", age: "48m", sla: "On track", status: "In progress" },
  { id: "TK-4804", subject: "Subscription renewal charged twice", customer: "Olivia Martin", queue: "Billing", owner: "D. Park", priority: "Urgent", age: "4h 11m", sla: "Breached", status: "Escalated" },
  { id: "TK-4799", subject: "Order address needs correction", customer: "Andre Johnson", queue: "Fulfillment", owner: "R. Shah", priority: "Low", age: "26m", sla: "On track", status: "Open" },
  { id: "TK-4793", subject: "Warranty claim needs an update", customer: "Sofia Nguyen", queue: "Product support", owner: "T. Evans", priority: "Low", age: "19m", sla: "On track", status: "Open" },
]

export const issueClusters = [
  { name: "Delivery status and carrier handoff", tickets: 1284, change: "+18%", driver: "Carrier scan delays", confidence: 94, deflection: "$42k / mo", team: "Logistics" },
  { name: "Refund timing and payment reversals", tickets: 846, change: "+7%", driver: "Bank settlement windows", confidence: 89, deflection: "$28k / mo", team: "Billing" },
  { name: "Account recovery and password resets", tickets: 612, change: "+11%", driver: "Mobile reset-flow friction", confidence: 91, deflection: "$18k / mo", team: "Product support" },
  { name: "Return label generation", tickets: 394, change: "−4%", driver: "Expired label links", confidence: 86, deflection: "$11k / mo", team: "Returns" },
]

export const driverChartData = [
  { driver: "Carrier scans", tickets: 1284, fill: "var(--chart-1)" },
  { driver: "Refund timing", tickets: 846, fill: "var(--chart-2)" },
  { driver: "Password reset", tickets: 612, fill: "var(--chart-4)" },
  { driver: "Return labels", tickets: 394, fill: "var(--chart-3)" },
  { driver: "Order changes", tickets: 271, fill: "var(--chart-5)" },
]

export const forecastData = [
  { day: "Today", actual: 82, forecast: 82, lower: 76, upper: 88 },
  { day: "Oct 29", actual: 84, forecast: 84, lower: 78, upper: 90 },
  { day: "Oct 30", actual: null, forecast: 86, lower: 79, upper: 93 },
  { day: "Oct 31", actual: null, forecast: 89, lower: 81, upper: 97 },
  { day: "Nov 1", actual: null, forecast: 87, lower: 78, upper: 96 },
  { day: "Nov 2", actual: null, forecast: 91, lower: 82, upper: 100 },
  { day: "Nov 3", actual: null, forecast: 94, lower: 84, upper: 104 },
  { day: "Nov 4", actual: null, forecast: 92, lower: 82, upper: 102 },
  { day: "Nov 5", actual: null, forecast: 96, lower: 85, upper: 107 },
  { day: "Nov 6", actual: null, forecast: 99, lower: 87, upper: 111 },
  { day: "Nov 7", actual: null, forecast: 97, lower: 85, upper: 109 },
  { day: "Nov 8", actual: null, forecast: 102, lower: 89, upper: 115 },
  { day: "Nov 9", actual: null, forecast: 105, lower: 91, upper: 119 },
  { day: "Nov 10", actual: null, forecast: 101, lower: 87, upper: 115 },
]

export const monthlyHistory = [
  { month: "Nov", tickets: 10920, sla: 89.2, resolution: 5.7 },
  { month: "Dec", tickets: 11640, sla: 90.1, resolution: 5.4 },
  { month: "Jan", tickets: 12480, sla: 91.3, resolution: 5.2 },
  { month: "Feb", tickets: 11860, sla: 91.8, resolution: 5.1 },
  { month: "Mar", tickets: 13240, sla: 92.4, resolution: 4.9 },
  { month: "Apr", tickets: 12890, sla: 93.1, resolution: 4.8 },
  { month: "May", tickets: 13750, sla: 93.3, resolution: 4.7 },
  { month: "Jun", tickets: 14120, sla: 94.2, resolution: 4.6 },
  { month: "Jul", tickets: 13880, sla: 94.8, resolution: 4.5 },
  { month: "Aug", tickets: 14620, sla: 95.2, resolution: 4.4 },
  { month: "Sep", tickets: 15140, sla: 95.7, resolution: 4.3 },
  { month: "Oct", tickets: 15480, sla: 96.1, resolution: 4.2 },
]

export const teams = [
  { name: "Billing", lead: "Jordan Lee", active: 18, utilization: 94, target: 82, backlog: 312, change: "+12%" },
  { name: "Logistics", lead: "Mina Kim", active: 24, utilization: 88, target: 84, backlog: 208, change: "+6%" },
  { name: "Returns", lead: "Marcus Ortiz", active: 16, utilization: 71, target: 82, backlog: 94, change: "−3%" },
  { name: "Account access", lead: "Sophie Chen", active: 14, utilization: 78, target: 80, backlog: 86, change: "−8%" },
  { name: "Product support", lead: "Tyler Evans", active: 12, utilization: 83, target: 81, backlog: 112, change: "+2%" },
]

export const recommendations = [
  { id: "rec-01", category: "Staffing", title: "Add two flex agents to Billing from 10am–1pm", reason: "The queue is projected to reach 94% utilization for three consecutive weekdays.", impact: "Protect 312 tickets from SLA risk", confidence: 93, owner: "Billing", effort: "Low", status: "Pending review" },
  { id: "rec-02", category: "Automation", title: "Trigger proactive delivery updates after a missed carrier scan", reason: "Customers contact support 2.3× more often when the carrier has no scan for 24 hours.", impact: "Reduce repeat contacts by 18%", confidence: 91, owner: "Logistics", effort: "Medium", status: "Pending review" },
  { id: "rec-03", category: "Process", title: "Extend return-label validity from 7 to 14 days", reason: "Expired-label tickets are concentrated among customers who start returns on weekends.", impact: "Save 6.4 agent hours per week", confidence: 86, owner: "Returns", effort: "Low", status: "Pending review" },
  { id: "rec-04", category: "Product", title: "Add a recovery link to the mobile password-reset error state", reason: "11% of account-access contacts begin after a reset link expires in-app.", impact: "Deflect 420 contacts per month", confidence: 88, owner: "Product support", effort: "Medium", status: "Pending review" },
]

export const outcomeHistory = [
  { week: "Sep 9", baseline: 88.2, outcome: 88.2 },
  { week: "Sep 16", baseline: 88.5, outcome: 89.4 },
  { week: "Sep 23", baseline: 88.7, outcome: 90.2 },
  { week: "Sep 30", baseline: 89.1, outcome: 91.5 },
  { week: "Oct 7", baseline: 89.3, outcome: 92.4 },
  { week: "Oct 14", baseline: 89.4, outcome: 93.1 },
  { week: "Oct 21", baseline: 89.6, outcome: 94.2 },
  { week: "Oct 28", baseline: 89.8, outcome: 95.1 },
]

export const dataSources = [
  { name: "Zendesk Support", type: "Ticket events", lastSync: "2 min ago", records: "2.4k today", status: "Healthy", quality: 99.8 },
  { name: "Shopify Orders", type: "Order and fulfillment", lastSync: "8 min ago", records: "1.8k today", status: "Healthy", quality: 99.2 },
  { name: "Carrier event stream", type: "Delivery scans", lastSync: "11 min ago", records: "8.6k today", status: "Delayed", quality: 96.4 },
  { name: "Workforce schedule", type: "Agent availability", lastSync: "24 min ago", records: "84 active shifts", status: "Healthy", quality: 98.9 },
]
