# OpsPilot Workload Optimization UI

The Workload Optimization page is connected to the team-level FastAPI OR-Tools endpoints.

## Required environment variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WORKSPACE_ID=8304b72f-397d-4582-bf18-6d1d29c050b8
```

Restart Next.js after changing `.env.local`.

## API calls

Generate a read-only preview:

`POST /api/v1/workload-optimization/solve`

The UI sends `workspace_id`, `planning_horizon_hours`, `include_unassigned`, `allow_reassignment`, `default_estimate_minutes`, and `max_solve_seconds`.

Apply selected manager-approved assignments:

`POST /api/v1/workload-optimization/apply`

The UI sends `optimization_id` and a selected subset of allocations with `ticket_id`, `expected_from_team_id`, and `to_team_id`.

## Approval safeguards

- Open tickets with a changed team assignment are preselected.
- In-progress and pending-customer tickets are shown with a review warning and remain unselected until the manager explicitly selects them.
- The manager must confirm before the apply request is sent.
- The backend revalidates the ticket's current team, active status, target team, and category eligibility. It records assignment changes in `ticket_events`.
- No assignments change when a preview is generated.

## Metric interpretation

`backlog_vs_planning_capacity_pct` is estimated remaining handling minutes divided by capacity scaled to the planning horizon. It is not measured agent utilization.
