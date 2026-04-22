---
name: vercel-supabase-ops
description: Work safely in the ShoeGlitch Next.js, Vercel, and Supabase stack with strong server-client boundaries, typed database access, caching discipline, safe route handlers, scheduled refreshes, and deployment-aware patterns.
---

# Purpose
Protect live flows while shipping new product surfaces.

# Use this skill when
- Touching Supabase tables, auth, route handlers, cron flows, cache behavior, env vars, deployment-sensitive code, or server-client boundaries.

# Stack rules
- Respect Next.js App Router server/client separation.
- Keep secrets on the server.
- Use typed interfaces for persisted payloads.
- Prefer narrow route handlers over all-purpose mutation endpoints.
- Keep deploy-critical behavior observable and recoverable.

# Supabase rules
- Migrations first for schema changes.
- Separate read models from mutation logic when it reduces blast radius.
- Keep admin client usage server-only.
- Avoid making live flows depend on optional integrations unless they degrade safely.

# Caching rules
- Cache durable content aggressively.
- Revalidate freshness-sensitive feed data intentionally.
- Do not mix stale business-critical state with static marketing content.

# Scheduled jobs
- Use scheduled refresh patterns for source pulls, score recompute, cache warmups, and content materialization.
- Jobs must be idempotent.
- Jobs must log source failures and partial completion clearly.

# Error handling
- Fail soft where possible.
- A broken external source should not take down booking or the public site.
- Route handlers should return useful structured errors.

# Anti-patterns
- Do not blur client and server logic.
- Do not make optional env vars mandatory for unrelated live flows.
- Do not ship fragile cron logic without safe defaults.
