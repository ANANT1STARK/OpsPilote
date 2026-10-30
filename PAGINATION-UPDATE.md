# OpsPilot Live Operations: API-backed pagination

## What changed

- The Live Operations ticket table now calls `GET /api/v1/tickets` with `limit` and `offset`.
- It reads the backend response contract: `{ items, total, limit, offset }`.
- The initial page size is 50; selectable sizes are 25, 50, 100, and 200 (the API's maximum is 200).
- Previous/Next controls navigate server-side pages and display the visible range, e.g. `Showing 1–50 of 1,504 tickets`.
- Search is sent to the backend using `search`; the backend applies it before counting and pagination.
- Status chips are sent to the backend using the supported `status` query parameter (`open`, `in_progress`, `pending_customer`).
- Ticket rows are mapped from actual API fields; the old mock `liveTickets` array is no longer used on this page.
- Summary cards and team workload are loaded from `/api/v1/overview?period=7d` and reflect current-state fields.
- Manual refresh and a 30-second polling cycle re-fetch the current page and summary.
- Workspace ID and API URL environment values are trimmed to avoid accidental whitespace in `.env.local`.

## Requirements

The FastAPI tickets endpoint must support:

- `workspace_id` (required)
- `limit` (1–200)
- `offset` (0 or greater)
- `search` (optional)
- `status` (optional; `open`, `in_progress`, `pending_customer`, `resolved`, or `closed`)

Its JSON response must contain `items`, `total`, `limit`, and `offset`.

## Run

Keep FastAPI running, then restart Next.js after any `.env.local` change:

```bash
npm run dev
```

Open `/dashboard/live-operations`. The first view should show up to 50 rows, with Previous/Next controls and the total filtered count. Searching or changing a status resets the page to page 1.
