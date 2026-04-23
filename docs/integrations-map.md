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

Main files:
- `src/lib/email.ts`
- watchlist/alert handlers in `src/features/intelligence/watchlist/*`

Watch for:
- env configuration
- duplicate sends
- non-idempotent retry behavior

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
