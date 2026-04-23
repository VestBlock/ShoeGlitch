# ShoeGlitch Email Event Matrix

## Customer lifecycle
- `booking_created`
  - recipient: customer
  - email: order confirmation
  - status: live
- `order_status_changed`
  - recipient: customer
  - email: status update
  - status: live
- `order_completed`
  - recipient: customer
  - email: completion notice
  - status: live
- `refund_processed`
  - recipient: customer
  - email: refund confirmation
  - status: live
- `operator_on_the_way`
  - recipient: customer
  - email: operator ETA / on-the-way
  - status: live

## Operator lifecycle
- `operator_application_submitted`
  - recipient: admin
  - email: application alert
  - status: live
- `operator_application_submitted`
  - recipient: applicant
  - email: application confirmation
  - status: live
- `operator_kit_payment_confirmed`
  - recipient: applicant
  - email: kit payment confirmation
  - status: live
- `operator_application_approved`
  - recipient: applicant
  - email: approval + next step
  - status: live
- `operator_application_rejected`
  - recipient: applicant
  - email: rejection / hold message
  - status: live
- `new_order_assigned_or_visible`
  - recipient: cleaner/operator
  - email: booking alert
  - status: live

## Intelligence / retention lifecycle
- `watchlist_match_release`
  - recipient: member
  - email: release alert
  - status: live
- `watchlist_match_restock`
  - recipient: member
  - email: restock alert
  - status: scaffolded unless source emits restock events
- `watchlist_match_price_drop`
  - recipient: member
  - email: price-drop alert
  - status: scaffolded unless price events are wired
- `release_digest_ready`
  - recipient: opted-in members
  - email: digest / recap
  - status: scaffolded

## Admin / ops
- `important_operator_application`
  - recipient: admin inbox
  - email: detailed application alert
  - status: live
- `automation_failed`
  - recipient: admin inbox
  - email: automation failure
  - status: scaffolded

## Notes
- “Live” means code exists in the app today.
- “Scaffolded” means the architecture should support it, but the trigger and delivery path still need implementation.
