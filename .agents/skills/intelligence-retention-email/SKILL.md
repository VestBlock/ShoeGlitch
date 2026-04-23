# intelligence-retention-email

Use this skill when work touches sneaker watchlists, release alerts, restock alerts, price-drop alerts, or intelligence-member retention email.

## Objective
Use ShoeGlitch intelligence content to drive:
- repeat visits
- watchlist retention
- release awareness
- bookings tied to high-interest pairs

## Rules
- Tie alerts to normalized sneaker identity first:
  - SKU when available
  - otherwise brand + model + colorway
- Keep one alert reason per email:
  - release
  - restock
  - price drop
  - digest / roundup
- Link back to the canonical site page, not directly to a provider-only destination when the site has a stronger landing page.
- Use the existing watchlist dedupe logic as the source of truth; do not add a second alert-dedupe system casually.

## Preferred content blocks
- sneaker name
- alert reason
- release or event date
- price context when available
- image
- one primary CTA:
  - view release page
  - view watchlist item
  - book cleaning
  - restore this pair

## Anti-patterns
- generic “something happened” alerts
- duplicate alerts for the same event and user
- overlong captions copied from social content
- provider-specific jargon leaking into the member-facing email
