# Repo Map

This file is the fastest stable orientation layer for ShoeGlitch. Read this before broad code exploration.

## Top-level layout
- `src/app`: Next.js App Router routes, layouts, route handlers, and protected dashboards.
- `src/components`: reusable UI components shared across public pages, SEO pages, intelligence surfaces, and dashboards.
- `src/features`: domain logic that should stay separate from page components.
- `src/lib`: shared infrastructure and app utilities such as Supabase, Stripe, email, storage, coverage, and pricing.
- `.agents/skills`: repo-local Codex operating skills.
- `docs`: compact orientation docs and feature notes.
- `public`: static assets, SEO manifest snapshots, and media.
- `supabase/migrations`: schema changes that must stay aligned with production data models.
- `scripts`: small operational or export utilities.

## Domain modules

### `src/features/intelligence`
Sneaker Intelligence Feed domain.
- `providers`: external sneaker providers and normalization boundaries.
- `adapters`: source-specific shaping and fallback logic.
- `watchlist`: watchlist, matching, and alert system foundations.
- `service.ts`, `scoring.ts`, `types.ts`: feed orchestration, scoring, and shared intelligence models.

### `src/features/seo`
SEO/AEO automation system.
- route catalogs
- content builders
- internal-link rules
- schema builders
- route-manifest automation

### `src/features/operator-seo`
Operator-acquisition SEO/AEO system.
- recruitment hubs
- city opportunity pages
- role-specific operator pages
- side-hustle and business-start guides
- operator route-manifest expansion

### `src/features/releases`
Sneaker release content engine.
- release-page model builders
- manual editorial enrichment hooks
- release-specific schema
- reusable page shell for product/release content
- cleaning-intent and alert-intent content families for the same sneaker records
- automation budget and manifest builders for release-family pages

## App route zones

### `src/app/(public)`
Public marketing, booking, intelligence, and SEO landing routes.

### `src/app/(public)/releases`
Reusable sneaker release content route family powered by structured sneaker data plus optional manual editorial enrichment.

### `src/app/(public)/worth-restoring`
Restoration-intent content route family derived from the same sneaker release data and scoring layer.

### `src/app/(public)/how-to-clean`
Cleaning-intent content route family derived from the same sneaker release data and ShoeGlitch care scoring.

### `src/app/(public)/release-alerts`
Alert-intent content route family that turns release data into watchlist and retention pages.

### `src/app/(public)/operators`, `become-an-operator`, `operator-opportunities`, `pickup-dropoff-operator`
Operator-acquisition SEO route families tied to the live `/operator/apply` conversion path.

### `src/app/api`
Server route handlers for booking, SEO manifests, intelligence search/product, growth tooling, watchlist, and Stripe webhooks.

### `src/app/customer`, `src/app/cleaner`, `src/app/city-manager`, `src/app/admin`
Protected operational surfaces. These are role-gated and should be treated as production-sensitive.

### `src/app/[primary]/[secondary]/[[...rest]]`
Generic growth/programmatic route family. Only touch this when working on the growth engine or route generation systems.

## High-sensitivity files
- `src/middleware.ts`: auth and role gating.
- `src/app/layout.tsx`: app-wide shell and metadata root.
- `src/lib/supabase/*`: auth/data boundary.
- `src/lib/stripe.ts` and `src/app/api/stripe/webhook/route.ts`: payments.
- `src/lib/email.ts`: notification delivery.
- `src/app/(public)/book/*`: booking and conversion flow.

## Orientation rules
- If the task is route-specific, read `docs/route-map.md` next.
- If the task touches external systems, read `docs/integrations-map.md` next.
- If the task is structural or cross-cutting, read `docs/architecture-summary.md` next.
