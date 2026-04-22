---
name: scraping-and-compliance
description: Handle sneaker scraping carefully with official-API-first logic, isolated source scrapers, rate limiting, retries, backoff, robots awareness, source tagging, and graceful failure boundaries.
---

# Purpose
Collect external sneaker data without turning the app into a brittle scraper pile.

# Use this skill when
- Adding retailer scrapers, release scrapers, marketplace scrapers, or hybrid API plus scrape data ingestion.

# Core policy
- Prefer official APIs first.
- Scrape only when justified.
- Treat every source as fragile.

# Scraper rules
- One source, one adapter.
- Keep selectors in one place.
- Tag every normalized record with its source and fetch timestamp.
- Add rate limiting, retries, exponential backoff, and clear timeout handling.
- Respect robots rules and source constraints where applicable.

# Reliability rules
- Scraper failure must not crash the whole feed.
- Return partial data with health warnings when needed.
- Log parse failures, selector drift, and suspicious empty results.

# Maintainability rules
- Keep source-specific parsing out of generic ranking or UI modules.
- Do not hard-code brittle assumptions across the app.
- Prefer semantic selectors and extraction helpers over giant inline parsing blobs.

# Anti-patterns
- Do not build “magic” scrapers with hidden parsing logic.
- Do not assume HTML structure is stable.
- Do not silently replace missing data with false certainty.
