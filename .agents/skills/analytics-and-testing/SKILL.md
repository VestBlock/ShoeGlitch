---
name: analytics-and-testing
description: Validate ShoeGlitch SEO/AEO pages with route checks, schema checks, metadata checks, CTA tracking sanity, and mobile/performance QA before calling the work done.
---

# Purpose
Check SEO/AEO work like a release, not like a draft.

# Use this skill when
- Shipping new city pages or service pages
- Updating metadata, schema, internal links, or CTA surfaces

# Required checks
- route loads
- metadata exists
- JSON-LD exists
- empty-state handling
- related links render
- CTA URLs are valid
- mobile layout sanity
- sitemap coverage if route is indexable

# QA rules
- Validate at least one representative route per page family.
- Prefer scripted checks for repeatable route assertions.
- Pair scripted verification with one visual sanity pass when possible.

# Anti-patterns
- Do not rely on “build passed” as SEO validation.
- Do not ship pages missing schema or metadata.
- Do not leave broken internal links in production templates.

# References
- Read `references/qa-checklist.md`.
- Run `scripts/check-seo-routes.ts` for quick route-level verification.
