---
name: repo-memory
description: Start faster in ShoeGlitch by using the repo map, architecture summary, route map, and integrations map as the first orientation layer before reading broad code.
---

# Purpose
Reduce repeated exploration by treating the repo docs as the compact system of record for structure, routing, and external dependencies.

# Use this skill when
- Starting a new task in the repo.
- Making structural changes.
- Working across multiple directories.
- A previous run spent too much time exploring.
- The codebase has grown and needs a stable orientation layer.

# Startup checklist
1. Read `docs/repo-map.md`.
2. Read `docs/architecture-summary.md`.
3. If routes are involved, read `docs/route-map.md`.
4. If external systems are involved, read `docs/integrations-map.md`.
5. Only then inspect the smallest relevant implementation file set.

# Operating rules
- Do not scan the entire repository by default.
- Do not reread stable foundation files unless the task touches them.
- Prefer targeted inspection over broad exploration.
- Treat repo docs as the first orientation layer, not the final source of truth.
- Update the repo docs after structural changes.
- Summarize changed files and architectural impact after work.

# Anti-patterns
- Reading many files before defining the target change.
- Exploring unrelated directories “just in case.”
- Duplicating architecture notes only in chat instead of updating repo docs.
- Making architecture changes without updating the repo map.

# Success criteria
- Faster startup on future tasks.
- Less repeated file reading.
- Clearer codebase orientation.
- Better continuity across sessions.

# References
- Read `docs/repo-map.md` first.
- Read `docs/architecture-summary.md` second.
- Use `docs/route-map.md` for route work.
- Use `docs/integrations-map.md` for Supabase, Stripe, Resend, Vercel, sneaker data, and external-system changes.
