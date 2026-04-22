---
name: testing-and-qa
description: Validate the Sneaker Intelligence Feed with normalization tests, scoring tests, empty and stale source coverage, metadata and schema checks, mobile checks, and performance sanity checks before shipping.
---

# Purpose
Check the product like QA, not just like a coder.

# Use this skill when
- Shipping feed ingestion, scoring logic, SEO pages, lead capture, or any intelligence surface that could affect discoverability or conversion.

# Required checks
- normalization tests
- dedupe behavior
- scoring tests
- empty-state rendering
- stale-source fallback behavior
- broken-source fallback behavior
- mobile behavior
- metadata and schema validity
- performance sanity checks

# QA rules
- Test the failure states on purpose.
- Verify that stale data is labeled stale.
- Verify that low-confidence data does not present like a strong signal.
- Verify that CTA blocks still make sense when score data is thin.
- Verify that important pages still render without JS-driven enrichment.

# SEO/AEO checks
- title present
- meta description present
- canonical present
- schema present where expected
- FAQ block readable
- answer-first structure intact

# Performance checks
- no giant client payloads without a reason
- no unbounded feed rendering
- no avoidable layout shifts
- images sized intentionally

# Scripts
- Use `scripts/check-feed.ts` as a lightweight validation harness.
