import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata = {
  title: {
    default: "OpsPilot AI | Operations intelligence",
    template: "%s | OpsPilot AI",
  },
  description: "A unified operations intelligence workspace for support leaders to monitor service health, understand ticket drivers, and make confident decisions.",
  applicationName: "OpsPilot AI",
  keywords: ["operations analytics", "support intelligence", "SLA monitoring", "workforce optimization"],
}

export const viewport = {
  colorScheme: "dark",
  themeColor: "#111522",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
