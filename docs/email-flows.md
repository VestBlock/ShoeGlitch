# Email Flows

This file is the source of truth for what ShoeGlitch emails are actually live, what triggers them, and what still needs implementation.

## Delivery layer
- shared sender: `src/lib/email.ts`
- provider: Resend
- current from/reply-to: `contact@shoeglitch.com`

## Live email flows

### Customer
- order confirmation
- customer welcome email on first authenticated account provisioning
- status update
- order completed
- refund confirmation
- operator on the way
- abandoned booking follow-up after expired checkout session

### Operator / cleaner
- new order booking alert to cleaners/operators
- operator application admin alert
- operator application confirmation to applicant
- operator kit payment confirmation
- operator approval email
- operator rejection / application update email

### Intelligence members
- sneaker watchlist alert email
- sneaker watchlist digest email

## Incomplete / not yet live
- intelligence digest / recap automation beyond watchlist digest batching
- broader restock and price-drop member email quality still depends on live event-source coverage
- admin alerts for automation failures

## Configuration
- `RESEND_API_KEY`
- `ADMIN_ALERT_EMAIL`
- `ADMIN_ALERT_EMAILS`

## Notes
- New email work should extend `src/lib/email.ts` instead of adding route-local mailers.
- Email triggers should map to durable server-side events, not just page actions or client assumptions.
