---
name: sneaker-data-ingestion
description: Build a resilient multi-source sneaker data ingestion layer with API adapters, scraper adapters, normalization, deduping, caching, refresh workflows, source health tracking, and graceful degradation.
---

# Purpose
Create a durable ingestion system for sneaker intelligence products.

# Use this skill when
- Pulling sneaker data from APIs, scrapers, release feeds, marketplaces, or retailer pages.
- Normalizing sneaker records across multiple sources.
- Building refresh jobs, cache layers, source monitoring, or failover behavior.

# Operating model
- Use adapter-based ingestion.
- Raw source payloads and normalized application models must be separate.
- Every source should be replaceable without breaking the rest of the system.

# Required architecture
- `sources/<source-name>/adapter.ts`
- `sources/<source-name>/normalize.ts`
- `sources/<source-name>/health.ts`
- normalization pipeline
- dedupe pipeline
- persistence layer
- cache and refresh layer

# Core entities
- `Sneaker`
- `SourceListing`
- `ReleaseEvent`
- `MarketplacePriceSnapshot`
- `ScoreRecord`
- `SneakerImage`
- `RetailerLink`

# Rules
- Keep raw payloads untouched for debugging and replay.
- Normalize into app-safe models before ranking or rendering.
- Add `source`, `fetchedAt`, and `confidence` metadata to normalized records.
- Track freshness and stale thresholds explicitly.
- Prefer idempotent refresh jobs.

# Dedupe guidance
- Dedupe on a compound identity, not just sneaker name.
- Strong keys:
  - SKU / style code
  - brand
  - silhouette
  - release date
- Soft-match only when strong identifiers are missing.
- Store collision notes when records merge imperfectly.

# Caching and refresh
- Cache by source and by normalized entity.
- Allow partial feed rendering if one source fails.
- Use stale-while-revalidate where it helps feed speed.
- Source failures should degrade scores and freshness, not blank the whole product.

# Source health tracking
- Track:
  - last success
  - consecutive failures
  - average latency
  - empty payload rate
  - schema mismatch warnings
- Surface source health to internal dashboards and logs.

# Anti-patterns
- Do not parse remote payloads directly inside route handlers.
- Do not couple UI cards to source-specific field names.
- Do not trust a single source for market truth.
- Do not silently swallow normalization failures.

# References
- Read `references/data-model.md` before defining or changing core types.
