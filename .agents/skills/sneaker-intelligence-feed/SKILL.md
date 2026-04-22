---
name: sneaker-intelligence-feed
description: Build the ShoeGlitch Sneaker Intelligence Feed: upcoming drops, trending sneakers, flip candidates, restoration and cleaning opportunity scoring, and monetized service CTAs tied to actionable sneaker intelligence.
---

# Purpose
Build the Sneaker Intelligence Feed as a monetized product surface, not a generic sneaker news feed.

# Use this skill when
- The feature involves sneaker releases, trending models, resale opportunities, restore-worthy pairs, cleaning opportunities, or market-watch workflows.
- Codex is building the feed page, feed cards, table views, detail drawers, detail pages, saved-watch flows, or service upsells tied to sneaker data.
- Work spans product definition as well as implementation.

# Product standard
- The moat is intelligence plus service monetization.
- Every feed entry should help the user do something:
  - decide whether to buy
  - decide whether to flip
  - decide whether to restore
  - decide whether to clean
  - decide whether to watch and wait
- Avoid turning ShoeGlitch into another content-only release blog.

# Target product shape
- Main feed supports both cards and dense table mode.
- Filters should be designed for real decision-making:
  - release date
  - brand
  - silhouette
  - retail price
  - estimated resale spread
  - hype score
  - cleaning score
  - restoration score
  - flip potential
  - urgency
  - confidence
- Each item should support:
  - image
  - name
  - SKU or style code
  - release date
  - retail price
  - market price snapshot
  - score chips
  - source count
  - primary CTA
- Each item needs a detail surface:
  - drawer for quick scan
  - dedicated page for SEO and sharing

# Required CTA pattern
- At least one intelligence CTA:
  - `Watch market`
  - `Join waitlist`
  - `Track price`
- At least one service CTA when relevant:
  - `Book cleaning`
  - `Restore this pair`
  - `Get a quote`
- Service CTA must depend on the scores. Example:
  - high cleaning score -> emphasize cleaning
  - high restoration score -> emphasize restoration
  - high resale spread -> emphasize watchlist or waitlist

# UX rules
- Feed should answer "why this matters" in one glance.
- Use score chips and short labels before long text.
- Keep the first screen scannable.
- The visual hierarchy should be:
  - sneaker identity
  - market signal
  - opportunity score
  - CTA
- Support empty states:
  - no filters matched
  - source stale
  - market unavailable

# Page types to build from this skill
- `/intelligence`
- `/intelligence/releases`
- `/intelligence/trending`
- `/intelligence/restore-worthy`
- `/intelligence/cleaning-opportunities`
- `/intelligence/[slug]`

# Decision model
- Ask of every feature:
  - Does this improve discoverability?
  - Does this improve decision quality?
  - Does this create a monetizable next step?
- If the answer is no to all three, cut it.

# Anti-patterns
- Do not build a feed that is only chronological news.
- Do not overload cards with copy before scores and signals.
- Do not hard-code ranking logic in UI components.
- Do not mix source scraping logic into presentation components.
- Do not surface fake precision where the data is weak.

# Build order
1. Define normalized sneaker model and score record.
2. Build source adapters and normalization.
3. Compute scores in a dedicated ranking layer.
4. Render feed with clear filters and state handling.
5. Add detail page with service and watch CTAs.
6. Add SEO/AEO wrappers and schema.
7. Add lead capture and booking integration.

# References
- Use `../sneaker-data-ingestion/references/data-model.md` for model boundaries.
- Use `../sneaker-ranking-and-scoring/references/scoring-rules.md` for tunable score design.
- Use `../seo-aeo-growth/references/page-template.md` for SEO page structure.
