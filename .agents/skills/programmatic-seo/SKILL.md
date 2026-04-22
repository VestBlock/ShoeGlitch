---
name: programmatic-seo
description: Create scalable ShoeGlitch route systems for city, service, and query-intent pages using reusable templates, safe route catalogs, metadata generators, and low-duplication rendering.
---

# Purpose
Build scalable route systems, not isolated landing pages.

# Use this skill when
- Adding dynamic SEO routes.
- Building route catalogs, metadata generators, or template-driven page families.
- Expanding ShoeGlitch city/service coverage without duplicating page logic.

# Workflow
1. Identify the route family.
2. Define a typed route spec.
3. Separate route data from rendering.
4. Generate metadata and schema from the same spec.
5. Reuse one page component across the family.
6. Add sitemap coverage.

# Required structure
- route catalog or route builder
- typed page model
- metadata builder
- schema builder
- internal-link builder
- shared renderer

# Route families to prefer
- service + city
- service + near-me
- city hub
- service guide
- comparison page

# Anti-patterns
- Do not create a separate component tree per city.
- Do not hard-code metadata in route files if it can be derived from the route spec.
- Do not let provider-specific or CMS-specific data shapes leak into the page component.

# References
- Read `references/route-patterns.md` before designing a new page family.
