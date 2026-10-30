# OpsPilot Overview Dashboard

The Overview page has been rebuilt to use the FastAPI endpoint `GET /api/v1/overview` while preserving the existing dark navy / violet OpsPilot dashboard theme.

## Data source

The page requests:

```text
GET ${NEXT_PUBLIC_API_BASE_URL}/overview?period=7d|30d|90d
```

The shared `apiGet` helper adds `NEXT_PUBLIC_WORKSPACE_ID` as the `workspace_id` query parameter.

## Refresh behavior

The Overview requests fresh data on initial page load, when the reporting period changes, and every 30 seconds while the page is open. A manual Refresh button is also available. If a periodic refresh fails after a successful load, the last successful response remains visible with a warning.

## Metric sections

- **Period performance:** tickets created/resolved, average first-response time, average resolution time, and overall SLA breach rate, with comparison to the previous equal-length period.
- **Current snapshot:** active backlog, tickets with overdue SLA, tickets at risk within 30 minutes, high-priority backlog, unassigned tickets, and aged backlog. These values do not change when the reporting period changes.
- **Daily trends:** incoming vs. resolved tickets and first-response vs. resolution breach counts.
- **SLA performance:** outcome-based breach rates from the API's known met/breached SLA outcomes.
- **Manager signals:** deterministic threshold-based observations. They are explicitly not represented as AI predictions.
- **Team workload:** estimated outstanding work as a percentage of one day's configured capacity.
- **Queue composition:** active tickets by status and priority, plus top period categories.

## Run

Keep the backend running and ensure `.env.local` contains:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WORKSPACE_ID=<your-workspace-uuid>
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000/dashboard`.
