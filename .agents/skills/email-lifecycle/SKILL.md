# email-lifecycle

Use this skill when work touches email flows across the whole ShoeGlitch product, not just one route.

## Objective
Make ShoeGlitch email behavior consistent across:
- customer bookings and order updates
- operator applications and operator operations
- sneaker intelligence watchlists and release alerts
- admin/internal notifications

## Rules
- Treat `src/lib/email.ts` as the shared delivery layer. Extend it before creating route-local email senders.
- Keep all provider secrets server-side. Never expose Resend keys or recipient lists in client code.
- Separate three concerns:
  - event triggers
  - email composition
  - delivery/provider wiring
- Prefer branded HTML plus plain-text fallback for every email that matters.
- Make admin alerts configurable with env vars, never hard-coded to one personal inbox.
- Keep lifecycle state explicit. If an email depends on approval, fulfillment, or alert dedupe, tie it to that state change instead of page load or client actions.

## Email families
- Transactional customer email
  - order confirmation
  - status changes
  - completion
  - refund
- Operator email
  - application received
  - admin application alert
  - approval / rejection
  - onboarding / next-step notices
- Intelligence retention email
  - watchlist release alerts
  - restock alerts
  - price-drop alerts
  - release digest / recap
- Internal admin alerts
  - operator applications
  - failed automations worth human attention
  - important customer or watchlist events only when they need manual action

## Preferred architecture
- Delivery: `src/lib/email.ts`
- Trigger points:
  - booking and payment events
  - operator application actions
  - watchlist processing jobs
  - admin approval actions
- Config:
  - `RESEND_API_KEY`
  - `ADMIN_ALERT_EMAIL`
  - `ADMIN_ALERT_EMAILS`
  - any route-specific reply-to or ops inbox envs if later needed

## Anti-patterns
- composing email markup directly inside route handlers or page actions
- mixing business-state transitions with raw HTML templates
- sending the same alert from multiple code paths
- shipping emails without a plain-text version
- silent failures without logs

## Finish checklist
- identify the exact product event that should trigger the email
- verify dedupe/idempotency when retries are possible
- confirm admin recipients and reply-to behavior
- update `docs/email-flows.md`
- state clearly what is live vs scaffolded
