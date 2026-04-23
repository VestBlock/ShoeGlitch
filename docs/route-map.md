# Route Map

Use this file before exploring `src/app` broadly.

## Public marketing and booking
- `/` -> `src/app/(public)/page.tsx`
- `/services` -> `src/app/(public)/services`
- `/coverage` -> `src/app/(public)/coverage`
- `/mail-in` -> `src/app/(public)/mail-in`
- `/book` -> `src/app/(public)/book`
- `/pickup-dropoff` -> `src/app/(public)/pickup-dropoff`
- `/operator`, `/operator/apply`, `/operator/applied`, `/operator/dashboard` -> `src/app/(public)/operator/*`
- `/operators` -> operator opportunity index
- `/become-an-operator` -> main operator acquisition landing page
- `/operator-opportunities/[city]` -> city-specific operator recruitment pages
- `/pickup-dropoff-operator/[city]` -> city-specific pickup/drop-off operator pages
- `/start-a-sneaker-cleaning-business` -> operator acquisition guide page
- `/shoe-restoration-side-hustle` -> operator acquisition guide page
- `/login` -> `src/app/(public)/login`

## Sneaker intelligence
- `/intelligence` -> feed route in `src/app/(public)/intelligence/page.tsx`
- `/intelligence/[slug]` -> sneaker detail route
- `/releases/[slug]` -> structured sneaker release content route
- `/worth-restoring/[slug]` -> restoration-intent content route built from the same sneaker data
- `/how-to-clean/[slug]` -> cleaning-intent content route built from the same sneaker data
- `/release-alerts/[slug]` -> alert-intent content route connected to watchlist/retention flows
- `/customer/watchlist` -> signed-in watchlist surface
- `/api/intelligence/search` -> provider-backed search endpoint
- `/api/intelligence/product` -> provider-backed product endpoint
- `/api/watchlist/*` -> watchlist CRUD and processing
- `/api/social/queue` -> internal social draft listing and creation
- `/api/social/queue/[id]` -> internal social draft review updates
- `/api/social/scan` -> internal social draft generation sweep
- `/api/social/publish` -> internal Buffer scheduling and sync

## SEO/AEO route families
- `/sneaker-cleaning`
- `/shoe-restoration`
- `/pickup-dropoff`
- `/locations`

### City pages
- `/sneaker-cleaning/[city]`
- `/shoe-restoration/[city]`
- `/pickup-dropoff/[city]`
- `/locations/[city]`

### Near-me variants
- `/sneaker-cleaning/near-me`
- `/shoe-restoration/near-me`
- `/pickup-dropoff/near-me`

### Service-area pages
Generated under the city routes for supported areas. Check `src/features/seo/routes.ts` before editing these systems.

## Protected app routes
- `/customer/*`
- `/cleaner/*`
- `/city-manager/*`
- `/admin/*`
- `/admin/seo` -> SEO and automation reporting
- `/admin/automation` -> manual automation runs and recent run history
- `/admin/analytics` -> growth event and lead reporting
- `/admin/social` -> social queue and Buffer publishing visibility
- `/admin/operators` -> operator application review, kit payment status, and license document review
- `/admin/cities` -> city market creation, launch/pause controls, and local fee tuning

These are role-gated by `src/middleware.ts`. Do not change these routes casually.

## Generic growth route
- `src/app/[primary]/[secondary]/[[...rest]]`

This is the catchall growth/programmatic route family. Only inspect it when the task explicitly concerns the growth engine or generated SEO surfaces.

## Route inspection rules
- For public SEO work, inspect `src/features/seo` before reading every route file.
- For intelligence work, inspect `src/features/intelligence` before route handlers.
- For protected route work, inspect `src/middleware.ts` before the page component.
