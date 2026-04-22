# ShoeGlitch Codex Rules

This is a revenue-focused product codebase. Build for traffic, conversions, retention, and operational stability.

- Preserve production stability first. Do not break booking, auth, dashboards, payments, or live public pages.
- Before coding, inspect the relevant files, architecture, and existing patterns.
- Prefer reusable modules, typed interfaces, and clear extension points over one-off hacks.
- For sneaker feed, scraping, release calendar, catalog, ranking, or intelligence work, load the sneaker-related skills in `.agents/skills/`.
- For landing pages, metadata, schema, discoverability, SEO, and AEO, load the `seo-aeo-growth` skill.
- For lead capture, booking flows, upsells, sticky CTAs, and monetization surfaces, load the `conversion-ui` skill.
- For database changes, auth, route handlers, background jobs, caching, and deployment-sensitive code, load the `vercel-supabase-ops` skill.
- For scraping, source adapters, retries, rate limits, robots awareness, and source fragility, load the `scraping-and-compliance` skill.
- Keep raw source data separate from normalized app models.
- Always leave the codebase cleaner than you found it.
- Prefer implementation over commentary.
- When finished, run relevant checks and summarize what changed, what still needs attention, and what could break.
