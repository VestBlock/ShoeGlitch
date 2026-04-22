# Architecture Summary

## App shape
ShoeGlitch is a Next.js 14 App Router application built around three product layers:
- public acquisition and booking
- protected operations
- sneaker intelligence and SEO automation

## Architectural principles
- Keep provider payloads, normalized models, and UI presentation separate.
- Preserve live booking, auth, payment, and dashboard flows first.
- Prefer server-driven rendering for indexable and operationally important pages.
- Use feature modules for domain logic; do not bury business rules in page components.

## Core systems

### 1. Public acquisition and booking
Main public routes live in `src/app/(public)`.
Key flows:
- homepage and service marketing
- booking and checkout
- coverage and service-area pages
- mail-in and pickup/drop-off offers

### 2. Protected operations
Role-gated surfaces live in:
- `src/app/customer`
- `src/app/cleaner`
- `src/app/city-manager`
- `src/app/admin`

Access control is enforced in `src/middleware.ts` and depends on Supabase auth plus app-level role records.

### 3. Sneaker Intelligence Feed
The intelligence system lives in `src/features/intelligence` and is exposed through:
- `/intelligence`
- `/intelligence/[slug]`
- `/api/intelligence/*`
- `/customer/watchlist`
- `/api/watchlist/*`

Key rule: external sneaker provider shapes should stop at the provider layer. Everything above that should use normalized app models.

### 4. SEO/AEO automation
The SEO system lives in `src/features/seo` and powers:
- service hubs
- city pages
- service-area pages
- route manifests and sitemap expansion

Key rule: SEO pages must answer the query clearly and drive bookings, not just create traffic.

### 4b. Operator-acquisition SEO/AEO
The operator recruitment SEO system lives in `src/features/operator-seo` and powers:
- operator recruitment hubs
- city opportunity pages
- pickup/drop-off operator pages
- side-hustle and business-start guides

Key rule: operator pages must drive qualified operator applications or city-interest leads, not generic “work with us” traffic.

### 5. Release content engine
The release content system lives in `src/features/releases` and powers:
- `/releases/[slug]`
- `/worth-restoring/[slug]`
- `/how-to-clean/[slug]`
- `/release-alerts/[slug]`
- structured release pages built from sneaker provider data
- optional manual editorial enrichment for silhouette history and release context

Key rule: release pages are not generic sneaker-blog pages. They combine structured release data, ShoeGlitch service intelligence, and conversion paths.

## Shared infrastructure
- Supabase: auth, application data, and some persistence/caching.
- Stripe: booking/payment workflows.
- Resend/email layer: transactional notifications and alerts.
- Vercel: deployment and environment management.

## Change-routing guidance
- Booking or checkout changes: start in `src/app/(public)/book` and related `src/lib/*`.
- Sneaker feed changes: start in `src/features/intelligence`.
- SEO route/system changes: start in `src/features/seo`.
- Operator recruitment SEO changes: start in `src/features/operator-seo` and the existing `/operator/apply` flow.
- Role/dashboard changes: start in `src/middleware.ts` and the relevant protected app subtree.
