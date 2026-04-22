---
name: sneaker-ranking-and-scoring
description: Compute transparent, tunable sneaker opportunity scores including hype, resale spread, cleaning score, restoration score, flip potential, urgency, and confidence without relying on fake precision.
---

# Purpose
Turn sneaker data into decision-grade signals.

# Use this skill when
- Building ranking, scoring, sorting, or recommendation logic for sneaker feed products.
- Designing score labels, thresholds, filters, or score-driven CTAs.

# Scoring philosophy
- Transparent
- Tunable
- Documented
- Safe defaults
- Easy to evolve
- No fake precision

# Required scores
- `hypeScore`
- `resaleSpread`
- `cleaningScore`
- `restorationScore`
- `flipPotential`
- `urgency`
- `confidence`

# How to think about each score
- `hypeScore`: demand and attention, not guaranteed profit.
- `resaleSpread`: margin signal between retail and market.
- `cleaningScore`: how likely the pair is to benefit from professional cleaning.
- `restorationScore`: how likely the pair is a restoration candidate.
- `flipPotential`: blended opportunity score, not just spread.
- `urgency`: time sensitivity around release or market move.
- `confidence`: confidence in the data quality, not confidence in the market outcome.

# Rules
- Keep raw inputs visible in logs or score payloads.
- Clamp scores to a readable scale like `0-100`.
- Round for presentation. Preserve more detail internally only if useful.
- Use confidence to dampen aggressive rankings when source quality is weak.
- Keep formulas in one module, not scattered across UI and routes.

# Product usage
- High `cleaningScore` -> surface `Book cleaning`
- High `restorationScore` -> surface `Restore this pair`
- High `flipPotential` and high `confidence` -> surface `Watch market`
- High `urgency` with medium confidence -> surface `Join waitlist`

# Anti-patterns
- Do not present a score of `87.364` to users.
- Do not rank on hype alone.
- Do not let stale prices drive confident ranking.
- Do not hide assumptions.

# References
- Read `references/scoring-rules.md` before implementing formulas.
