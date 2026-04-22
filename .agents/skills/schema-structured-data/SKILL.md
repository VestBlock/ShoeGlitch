---
name: schema-structured-data
description: Add dynamic JSON-LD to ShoeGlitch pages using reusable builders for FAQPage, LocalBusiness, Service, HowTo, BreadcrumbList, and related schemas tied to real page content.
---

# Purpose
Make pages machine-readable without duplicating page copy.

# Use this skill when
- Adding JSON-LD to city pages, service pages, guides, comparisons, or intelligence pages.

# Rules
- Generate schema from the same page model used by the UI.
- Use only schemas the page truly supports.
- Keep names, descriptions, and URLs aligned with visible content.

# Preferred schemas
- `FAQPage`
- `LocalBusiness`
- `Service`
- `HowTo`
- `BreadcrumbList`

# Implementation pattern
- one shared schema builder per page family
- canonical URL helper
- return array of schema objects
- render as `application/ld+json` scripts

# Anti-patterns
- Do not stuff multiple irrelevant schema types onto one page.
- Do not emit FAQPage when the FAQs are not visible on the page.
- Do not hard-code URLs if route builders already know them.

# References
- Read `references/schema-recipes.md` for page-to-schema mapping.
