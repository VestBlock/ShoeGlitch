# kicksdb-data-quality

Use this skill when working on KicksDB ingestion, normalized sneaker records, release pages, or confidence/readiness rules.

## Objective
Keep KicksDB as a structured source, not a leaky provider dependency.

## Rules
- Normalize provider fields before UI use.
- Separate raw payloads from normalized sneaker models.
- Prefer stable fields first:
  - id
  - sku
  - name
  - brand
  - model
  - colorway
  - releaseDate
  - retailPrice
  - imageUrl
  - availability
  - price summary
- Make incomplete provider data explicit with placeholders or confidence reductions.

## Quality checks
- SKU present or safely nullable
- release date parseable
- image URL usable
- price summary fields numeric or null
- market URL optional
- updated timestamps preserved

## Anti-patterns
- letting KicksDB-specific field names appear in page components
- pretending editorial content came from the provider
- failing hard when one market field is missing
