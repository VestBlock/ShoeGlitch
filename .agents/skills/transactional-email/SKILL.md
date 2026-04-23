# transactional-email

Use this skill when adding or changing customer-facing operational emails.

## Objective
Keep ShoeGlitch transactional email clear, branded, and tied to real operational state.

## Scope
- order confirmation
- status updates
- completion notices
- refunds
- pickup / operator ETA
- later: intake received, photos approved, package upgraded

## Rules
- Trigger from trusted server-side events only.
- For payments, prefer webhook-confirmed state over optimistic client assumptions.
- Mirror the exact service/package language used on the site. If steam-assisted cleaning is included in most packages, the email copy should reflect that accurately.
- Include enough detail to reduce support questions:
  - order reference
  - city/service context
  - next step
  - support contact

## Composition guidance
- Use one strong heading.
- One paragraph for the current state.
- One compact detail block.
- One main CTA back into the app when helpful.
- Keep the body short; transactional email is for action and confidence, not marketing overload.

## Anti-patterns
- “marketing voice” in critical operational emails
- sending before the underlying order/payment state is durable
- inconsistent package names between site and email
- forcing users to log in for information that could be stated in the email itself
