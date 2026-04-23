# ShoeGlitch Codex Operating Rules

This is a revenue-focused production codebase. Build for organic traffic, answer-engine visibility, bookings, and operational reliability.

- Preserve production stability first. Do not break booking, auth, dashboards, payments, intelligence pages, or live public routes.
- For new repo-spanning work or structural changes, load `repo-memory` first and use the docs in `docs/` as the orientation layer before broad code exploration.
- Inspect the existing files, data model, and route structure before coding.
- Prefer reusable modules, typed interfaces, and extension points over one-off page hacks.
- For sneaker intelligence, catalogs, release feeds, scraping, ranking, or market data, load the sneaker-related skills in `.agents/skills/`.
- For metadata, city pages, service pages, schema, internal links, and discoverability, load `seo-aeo-growth`, `programmatic-seo`, `local-city-pages`, `schema-structured-data`, `content-generation`, and `internal-linking` as needed.
- For lead capture, booking CTAs, service upsells, and monetization surfaces, load `conversion-cta`.
- For analytics, dashboards, automation visibility, or reporting work, load `analytics-instrumentation` and `admin-reporting`.
- For operator recruitment growth, load `operator-acquisition-growth`.
- For package logic, booking operations, and service-message consistency, load `booking-ops`.
- For transactional email, lifecycle email, admin alerts, and retention messaging, load `email-lifecycle`, `transactional-email`, `operator-email-ops`, and `intelligence-retention-email` as needed.
- For public copy review and placeholder cleanup, load `editorial-quality-control`.
- For KicksDB normalization, provider health, and sneaker-source confidence, load `kicksdb-data-quality`.
- For database, caching, route handlers, cron, Supabase, or deployment-sensitive changes, load `vercel-supabase-ops`.
- For scraping, rate limits, retries, robots awareness, and fragile sources, load `scraping-and-compliance`.
- Keep provider payloads, normalized app models, and UI presentation separate.
- Always leave the codebase cleaner than you found it.
- Prefer implementation over commentary.
- Before finishing, run the relevant checks and summarize what changed, what still needs attention, and what could break.
