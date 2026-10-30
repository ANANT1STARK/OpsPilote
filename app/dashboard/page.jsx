import { OverviewPage } from "@/components/dashboard/overview-page"

export const metadata = {
  title: "Overview",
  description: "Current operations health, ticket trends, SLA performance, and priority AI insights.",
}

export default function DashboardOverviewRoute() {
  return <OverviewPage />
}
