# Integrations Map

Use this file when the task touches external systems, secrets, or operational boundaries.

## Supabase
Purpose:
- auth
- role lookup
- operational data
- watchlist/alert persistence
- optional caching and provider snapshots

Main files:
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase-client.ts`
- `src/lib/db.ts`
- `src/middleware.ts`
- `supabase/migrations/*`

Watch for:
- server/client boundary mistakes
- auth cookie handling
- changing data assumptions without a migration

## Stripe
Purpose:
- checkout and booking payment handling

Main files:
- `src/lib/stripe.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/(public)/book/stripe-actions.ts`

Watch for:
- webhook/data consistency
- order creation side effects
- accidental breakage of confirmation/success routes

## Email / Resend
Purpose:
- booking notifications
- operator notifications
- watchlist alerts
- customer welcome and abandoned booking recovery
- watchlist digest emails
- admin application alerts

Main files:
- `src/lib/email.ts`
- `docs/email-flows.md`
- watchlist/alert handlers in `src/features/intelligence/watchlist/*`

Watch for:
- env configuration
- duplicate sends
- non-idempotent retry behavior
- copy that conflicts with the live product flow

## Sneaker data providers
Purpose:
- search
- product detail
- pricing/reference enrichment
- release-page structured content

Main files:
- `src/features/intelligence/providers/kicksdb.ts`
- `src/features/intelligence/providers/mock.ts`
- `src/features/intelligence/providers/normalize.ts`
- `src/features/intelligence/provider-service.ts`
- `src/features/releases/*`

Watch for:
- provider-specific response shapes leaking into app code
- brittle source assumptions
- fallback behavior when live providers fail
- automation budgets drifting beyond the current KicksDB plan

## SEO/AEO automation
Purpose:
- route manifests
- schema
- programmatic city/service pages
- operator acquisition pages
- admin visibility into route and release manifest health

Main files:
- `src/features/seo/*`
- `src/features/operator-seo/*`
- `src/app/api/seo/manifest/route.ts`
- `public/seo/route-manifest.json`
- `docs/seo-aeo-automation.md`

Watch for:
- generating routes without real coverage support
- thin pages with weak conversion intent
- breaking the live `/operator/apply` conversion path while adding recruitment pages

## Buffer social publishing
Purpose:
- schedule approved Instagram posts from existing SEO and release pages
- sync scheduled, published, and failed post state back into the queue

Main files:
- `src/features/social/*`
- `src/app/api/social/*`
- `scripts/social/run-automation.ts`
- `docs/social-automation.md`

Watch for:
- missing Buffer env configuration
- duplicate social candidates when source timestamps are unstable
- queue records bypassing review and getting scheduled too early
- provider-specific publishing payloads leaking beyond the adapter

## Growth events and reporting
Purpose:
- page-view and CTA tracking
- lead capture summaries
- booking, watchlist, operator-interest, and automation-run event summaries
- admin analytics dashboards

Main files:
- `src/app/api/growth/events/route.ts`
- `src/app/api/growth/leads/route.ts`
- `src/lib/growth/persistence.ts`
- `src/components/growth/GrowthTracker.tsx`
- `src/features/admin/analytics-reporting.ts`
- `src/features/admin/seo-reporting.ts`
- `src/features/admin/db-health.ts`
- `scripts/db/check-required-tables.ts`

Watch for:
- inconsistent event names
- missing `data-growth-cta` attributes on key templates
- dashboards assuming data exists when the tables are empty or unavailable
- new automation features that require migrations not yet applied in Supabase

## Deployment / runtime
Platform:
- Vercel for deployment and environment variables
- Next.js App Router runtime

Local checks:
- `npm run build`
- `npm run lint`
- `npm run typecheck`

Watch for:
- env drift between local and Vercel
- protected deployment URLs behaving differently from production aliases
