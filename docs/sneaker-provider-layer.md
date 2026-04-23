# Sneaker provider layer

This project uses a provider-to-normalized-model architecture for sneaker data.

## Flow

1. Provider client fetches raw data.
2. Provider normalizer maps raw records into `NormalizedSneaker`.
3. Intelligence services convert normalized records into UI/feed records with scoring and CTAs.
4. Cache hooks can persist raw provider responses in Supabase.

## Current providers

- `kicksdb`: primary live provider
- `nike-public`: public fallback provider for release/product coverage
- `mock`: fallback provider when live data is unavailable

## Files

- `src/features/intelligence/providers/types.ts`
- `src/features/intelligence/providers/normalize.ts`
- `src/features/intelligence/providers/kicksdb.ts`
- `src/features/intelligence/providers/nike-public.ts`
- `src/features/intelligence/providers/mock.ts`
- `src/features/intelligence/providers/cache.ts`
- `src/features/intelligence/provider-service.ts`

## Required environment variables

- `KICKS_API_KEY` or `KICKSDB_API_KEY`
- `KICKSDB_API_BASE_URL` or `KICKSDB_BASE_URL` optional, defaults to `https://api.kicks.dev/v3`

Supabase cache persistence also requires the existing project Supabase variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Normalized fields

- `id`
- `externalId`
- `provider`
- `sku`
- `slug`
- `name`
- `brand`
- `model`
- `colorway`
- `category`
- `releaseDate`
- `retailPrice`
- `imageUrl`
- `marketUrl`
- `sizes`
- `priceSummary`
- `availability`
- `updatedAt`

## Adding a new provider

1. Create a provider file under `src/features/intelligence/providers/`.
2. Fetch raw data there only.
3. Normalize into `NormalizedSneaker`.
4. Keep provider-specific fields out of UI components.
5. Add it to `provider-service.ts` as a primary, fallback, or dev-only comparison layer.

## Current limitation

The live UI is ready for KicksDB, but cache persistence requires the migration below to be applied before Supabase-backed caching becomes active.

## Local development fallback

If localhost does not have a usable KicksDB key, the KicksDB provider can fall back to the live ShoeGlitch production API as a dev-only proxy. That keeps local feed development moving while the direct local env is being fixed, without changing the public feed architecture.
