# SEO / AEO automation foundation

This repo now includes a reusable automation layer for ShoeGlitch city and service SEO pages.

## What it does
- derives indexable city-service routes from live ShoeGlitch city data
- supports adding new city markets from `/admin/cities`; active cities flow into coverage, booking, SEO city pages, operator pages, and automation manifests
- derives operator-acquisition routes from live ShoeGlitch city data and the existing operator apply flow
- builds reusable page models for:
  - `/operators`
  - `/become-an-operator`
  - `/operator-opportunities/[city]`
  - `/pickup-dropoff-operator/[city]`
  - `/start-a-sneaker-cleaning-business`
  - `/shoe-restoration-side-hustle`
  - `/locations`
  - `/sneaker-cleaning/[city]`
  - `/shoe-restoration/[city]`
  - `/pickup-dropoff/[city]`
  - `/locations/[city]`
  - `/sneaker-cleaning/[city]/[service-area]`
  - `/shoe-restoration/[city]/[service-area]`
  - `/pickup-dropoff/[city]/[service-area]`
  - `/sneaker-cleaning/near-me`
  - `/shoe-restoration/near-me`
  - `/pickup-dropoff/near-me`
- emits metadata and JSON-LD from the same model used by the page UI
- exposes a manifest builder for route audits and expansion planning
- exposes a live automation manifest endpoint at `/api/seo/manifest`
- exports a static route manifest snapshot to `public/seo/route-manifest.json`
- powers release content routes at `/releases/[slug]`
- powers restoration-intent content routes at `/worth-restoring/[slug]`
- powers cleaning-intent content routes at `/how-to-clean/[slug]`
- powers alert-intent retention pages at `/release-alerts/[slug]`
- exposes a release-content manifest endpoint at `/api/seo/release-manifest`
- exports a static release-content manifest snapshot to `public/seo/release-content-manifest.json`
- feeds those existing SEO and release page families into the social automation queue for review-first Instagram scheduling

## Core files
- `src/features/seo/routes.ts`
- `src/features/seo/data.ts`
- `src/features/seo/fallback-data.ts`
- `src/features/seo/content.ts`
- `src/features/seo/schema.ts`
- `src/features/seo/internal-links.ts`
- `src/features/seo/automation.ts`
- `src/features/operator-seo/routes.ts`
- `src/features/operator-seo/content.ts`
- `src/features/operator-seo/schema.ts`
- `src/features/operator-seo/automation.ts`
- `src/components/operator-seo/OperatorSeoLandingPage.tsx`
- `src/features/releases/content.ts`
- `src/features/releases/restoration-content.ts`
- `src/features/releases/cleaning-content.ts`
- `src/features/releases/alerts-content.ts`
- `src/features/releases/automation.ts`
- `src/components/seo/LocalLandingPage.tsx`
- `src/components/seo/ServiceHubLandingPage.tsx`
- `src/components/seo/LocationsIndexLandingPage.tsx`
- `src/components/releases/ReleaseLandingPage.tsx`
- `src/components/releases/WorthRestoringLandingPage.tsx`
- `src/components/releases/HowToCleanLandingPage.tsx`
- `src/components/releases/ReleaseAlertsLandingPage.tsx`
- `src/app/api/seo/manifest/route.ts`
- `src/app/api/seo/release-manifest/route.ts`
- `src/features/social/extract.ts`
- `src/features/social/service.ts`
- `src/app/api/social/*`
- `scripts/seo/export-route-manifest.ts`
- `scripts/releases/export-content-manifest.ts`

## Useful commands
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npx tsx .agents/skills/analytics-and-testing/scripts/check-seo-routes.ts http://localhost:3000/sneaker-cleaning/milwaukee`
- `npx tsx scripts/seo/export-route-manifest.ts`
- `curl http://localhost:3000/api/seo/manifest`
- `npx tsx scripts/releases/export-content-manifest.ts`
- `curl http://localhost:3000/api/seo/release-manifest`
- `npx tsx scripts/seo/verify-site-routes.ts`
- `npx tsx scripts/seo/check-content-quality.ts`
- `npx tsx scripts/seo/run-automation.ts`
- `npm run seo:automation`

## What the manifest now tracks
- route family (`hub`, `city`, `area`, `near-me`)
- operator route family (`operator-hub`, `operator-city`, `operator-guide`)
- page kind
- service slug
- city slug
- service-area label when relevant
- operator role when relevant

## Data fallback behavior
- Live Supabase city and service-area records remain the source of truth.
- `src/features/seo/fallback-data.ts` preserves the current published city and service-area route families when Supabase is unavailable during offline automation runs.
- The fallback exists to prevent route-manifest exports from shrinking during transient DB or sandbox network failures; it should be updated whenever active SEO city coverage changes intentionally.

## Release-content automation budget
KicksDB pricing currently lists:
- Free: 1,000 requests/month
- Starter: 50,000 requests/month
- Pro: 250,000 requests/month

ShoeGlitch should still publish more conservatively than the raw API ceiling, because crawl quality and conversion focus matter more than volume.

Current healthy defaults in the release-content automation layer:
- Free: 4 release pages/day, 1 worth-restoring page/day, 2 how-to-clean pages/day, 3 release-alert pages/day, 8 refreshes/day
- Starter: 8 release pages/day, 4 worth-restoring pages/day, 6 how-to-clean pages/day, 8 release-alert pages/day, 18 refreshes/day
- Pro: 20 release pages/day, 8 worth-restoring pages/day, 12 how-to-clean pages/day, 16 release-alert pages/day, 50 refreshes/day

The release automation now defaults to the conservative `free` tier unless `KICKSDB_PLAN` (or explicit budget overrides) is set, so the system stays safe even when the API tier is unclear.

Optional env overrides:
- `KICKSDB_PLAN=free|starter|pro|enterprise`
- `KICKSDB_DAILY_REQUEST_BUDGET=...`
- `KICKSDB_NEW_RELEASE_PAGES_PER_DAY=...`
- `KICKSDB_WORTH_RESTORING_PAGES_PER_DAY=...`
- `KICKSDB_HOW_TO_CLEAN_PAGES_PER_DAY=...`
- `KICKSDB_RELEASE_ALERT_PAGES_PER_DAY=...`
- `KICKSDB_REFRESHES_PER_DAY=...`

That keeps the content engine active without turning the site into a thin page factory.

## KicksDB batching strategy
The release/social system intentionally treats normalized ShoeGlitch pages as the source of truth, not raw KicksDB payloads. One KicksDB-backed feed/search response can populate many candidate release records, and those records then fan out into:
- `/releases/[slug]`
- `/how-to-clean/[slug]`
- `/worth-restoring/[slug]`
- `/release-alerts/[slug]`
- social draft candidates in `social_post_queue`

This gives ShoeGlitch the efficiency of one useful provider pull while preserving quality gates, duplicate prevention, internal links, CTAs, and review-first social publishing.

## Next automation steps
1. expand into service-area pages only for active cities with real coverage depth
2. plug the exported manifest into recurring QA and Search Console workflows
3. add “designer sneaker cleaning”, “sole whitening”, and other service-intent route families on the same model

## Recommended recurring jobs
- `SEO Automation Sweep`
  - export `public/seo/route-manifest.json`
  - export `public/seo/release-content-manifest.json`
  - verify representative public, SEO, operator, intelligence, and API routes
  - confirm metadata, schema, CTA surfaces, duplicate titles/descriptions, and public-copy quality still pass after automation updates

## Quality gates
- `scripts/seo/verify-site-routes.ts` checks representative routes, protected redirects, metadata, and H1 presence.
- `scripts/seo/check-content-quality.ts` checks a broader manifest-backed page set for duplicate metadata, missing conversion links, missing JSON-LD on structured routes, and accidental internal/mock copy.
- `npm run seo:automation` runs both checks after manifest export.

## Steam-cleaning messaging rule
- Steam-assisted cleaning is part of every service package above Fresh Start.
- Fresh Start remains the lightest entry tier and does not include steam treatment.
- Operator kit pages should make it clear that the highest tier includes the commercial steam cleaner brush setup used on premium jobs.
