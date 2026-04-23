# admin-reporting

Use this skill when adding admin dashboards, run summaries, automation visibility, or reporting views.

## Objective
Give operators and admins a readable control surface for:
- automation health
- content inventory
- route coverage
- funnel activity
- recent leads and alerts

## Rules
- Prefer server-side summaries over heavy client dashboards.
- Read from normalized manifests, Supabase event tables, and safe aggregation layers.
- Keep dashboards useful when data is empty or unavailable.
- Do not expose secrets, raw provider keys, or internal-only diagnostics to non-admin users.

## Dashboard priorities
1. status and freshness
2. totals and trend proxies
3. top routes / top families
4. recent activity
5. direct links to source systems or manifests

## Good status labels
- `live`
- `fresh`
- `warn`
- `stale`
- `empty`
- `unavailable`

## Anti-patterns
- pushing raw JSON blobs into the UI
- requiring client-side chart libraries for simple operational summaries
- mixing unrelated admin domains on one page

## Finish checklist
- protect the page with existing role gates
- show empty/unavailable states clearly
- link back to the canonical source route or manifest
- update repo docs if a new admin surface is added
