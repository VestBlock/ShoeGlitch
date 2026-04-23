# analytics-instrumentation

Use this skill when work touches analytics events, funnels, CTA tracking, page-view tracking, or reporting inputs.

## Objective
Instrument ShoeGlitch so dashboards answer:
- which routes get traffic
- which CTAs get clicked
- which template families convert
- where bookings, operator leads, and watchlist intent start

## Rules
- Reuse `/api/growth/events` and `/api/growth/leads` before adding new endpoints.
- Prefer normalized event names over page-specific ad hoc labels.
- Track at the template level first, then only add page-specific events when truly needed.
- Keep provider, booking, and admin logic separate from analytics capture.
- Never block the user flow on analytics delivery.

## Core event taxonomy
- `page_view`
- `cta_click`
- `lead_submit`
- `watchlist_save`
- `operator_interest`
- `booking_start`
- `booking_complete`

Use `metadata` for context like:
- `pageTitle`
- `href`
- `templateFamily`
- `service`
- `city`
- `slug`

## Where to instrument first
- shared SEO landing templates
- operator acquisition templates
- intelligence feed cards and detail pages
- release content templates
- booking entry points

## Anti-patterns
- inventing a new event name for every button
- tracking raw provider payloads
- adding analytics code to route handlers when a client-side template hook is enough
- making dashboards depend on fields that are not consistently populated

## Finish checklist
- add `GrowthTracker` or equivalent at the template/page level
- add `data-growth-cta` to meaningful CTA links
- verify events still degrade safely if the endpoint fails
- update admin reporting inputs when a new event family matters
