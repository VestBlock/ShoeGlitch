# Shoe Glitch

A multi-city shoe cleaning, restoration, and luxury sole-care marketplace.
Built as a venture-scale product from day one — city-aware architecture, role-based access, and fulfillment modes baked into every layer.

---

## 1. Product Architecture

**Stack**
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS for styling (premium urban-modern tokens)
- Zustand for client state (cart/booking, auth session)
- React Hook Form + Zod for form validation
- Server Actions for mutations; typed service layer for data access
- A pluggable data layer (`src/lib/db.ts`) with an in-memory seeded store that mirrors the Supabase schema 1:1 — swap the implementation without touching callers.

**Architectural principles**
1. **City-first**: every domain object carries a `cityId`. Queries filter by city before anything else. Pricing, coverage, dispatch, analytics all key off `cityId`.
2. **Role-first**: a single RBAC module (`src/lib/rbac.ts`) gates every route and server action.
3. **Service layer, not fat pages**: pages call `services/orders.ts`, `services/pricing.ts`, etc. Pages don't know how data is stored.
4. **Fulfillment-polymorphic orders**: `pickup | dropoff | mailin` share a base Order but drive different status flows and required fields.
5. **Pricing engine**: base price → city override → add-ons → fulfillment fees → rush → coupon. Pure function, fully testable.
6. **Assignment engine**: manual in MVP, but the `assignOrder()` signature already accepts the inputs a dispatch algorithm needs (territory, workload, specialization).

---

## 2. Folder Structure

```
shoe-glitch/
├── src/
│   ├── app/
│   │   ├── (public)/                  # Marketing + booking
│   │   │   ├── page.tsx               # Homepage
│   │   │   ├── services/page.tsx      # Service menu
│   │   │   ├── coverage/page.tsx      # ZIP coverage check
│   │   │   ├── book/                  # Multi-step booking
│   │   │   │   ├── page.tsx
│   │   │   │   └── confirmation/[orderId]/page.tsx
│   │   │   ├── mail-in/page.tsx       # Mail-in instructions
│   │   │   └── login/page.tsx
│   │   ├── customer/                  # Customer-only
│   │   │   ├── page.tsx               # Dashboard
│   │   │   ├── orders/page.tsx
│   │   │   └── orders/[id]/page.tsx
│   │   ├── cleaner/                   # Cleaner-only
│   │   │   ├── page.tsx
│   │   │   └── orders/[id]/page.tsx
│   │   ├── city-manager/              # City manager-only
│   │   │   └── page.tsx
│   │   ├── admin/                     # HQ admin
│   │   │   ├── page.tsx               # Overview analytics
│   │   │   ├── cities/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   └── team/page.tsx
│   │   ├── api/                       # REST endpoints (thin)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/                    # Reusable UI
│   ├── lib/
│   │   ├── db.ts                      # Data layer (swap to Supabase)
│   │   ├── pricing.ts                 # Pricing engine
│   │   ├── assignment.ts              # Assignment engine
│   │   ├── rbac.ts                    # Role-based access
│   │   ├── session.ts                 # Auth session helpers
│   │   ├── coverage.ts                # ZIP/radius validation
│   │   └── status.ts                  # Status flow machine
│   ├── services/                      # Business logic (server-safe)
│   │   ├── orders.ts
│   │   ├── cities.ts
│   │   ├── cleaners.ts
│   │   └── catalog.ts
│   ├── data/
│   │   └── seed.ts                    # Seed cities, services, users
│   └── types/
│       └── index.ts                   # Shared typed models
├── package.json
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── README.md
```

---

## 3. Database Schema

All tables scoped by `city_id` where applicable. Designed for Postgres/Supabase.

| Table | Purpose |
|---|---|
| `cities` | Every city the brand operates in. `active` flag launches/pauses a market. |
| `service_areas` | ZIP-level coverage zones inside a city. A city can have many zones. |
| `services` | Global service catalog (Fresh Start, Full Reset, etc.). |
| `city_service_pricing` | Per-city price override + rush eligibility per service. |
| `customers` | End users. |
| `cleaners` | Operators. Belong to a city + one or more service areas. |
| `city_managers` | Manage a single city. |
| `orders` | The core object. Always has `city_id`. |
| `order_events` | Append-only status history (who did what, when). |
| `order_items` | Line items (service + add-ons) with resolved pricing. |
| `coupons` | Optional promo codes; can scope by city. |
| `payouts` | Placeholder table for cleaner payouts. |

See `/supabase/schema.sql` for the full DDL (generated from `src/types/index.ts`).

---

## 4. Role / Permission Model

Four roles, enforced in `src/lib/rbac.ts`:

| Role | Scope | Can |
|---|---|---|
| `customer` | Self | Book, view own orders, upload photos |
| `cleaner` | Assigned orders in own city | View/update assigned orders, upload after-photos |
| `city_manager` | Single city | See all orders in city, assign cleaners, override local pricing |
| `super_admin` | Everything | Launch cities, global pricing, assign any role |

Every server action and route handler calls `requireRole(session, ...roles)`.
Every data query is further scoped: a city manager querying `orders` has `cityId` injected automatically.

---

## 5. Fulfillment Modes

| Mode | Statuses |
|---|---|
| `pickup` | Confirmed → Awaiting Pickup → Pickup Assigned → Picked Up → In Cleaning → Quality Check → Out for Delivery → Delivered → Completed |
| `dropoff` | Confirmed → Awaiting Drop-off → Received at Hub → In Cleaning → Quality Check → Ready for Pickup → Completed |
| `mailin` | Confirmed → Awaiting Shipment → Received at Hub → In Cleaning → Quality Check → Shipped Back → Delivered → Completed |

Status transitions validated by `src/lib/status.ts` — only legal next-states allowed.

---

## 6. Pricing Engine

```ts
finalPrice = basePrice
  + cityOverride (if any, replaces basePrice)
  + Σ addOns
  + fulfillmentFee (pickup/mailin)
  + rushFee (if selected + eligible)
  - coupon
  + tax (future)
```

Editable globally or per-city via admin. All pricing resolution goes through `src/lib/pricing.ts::quote()`.

---

## 7. Running Locally

```bash
npm install
npm run dev
```

Seeded demo users (email-only login — swap for Supabase Auth):
- Customer: `customer@shoeglitch.test`
- Cleaner: `cleaner.memphis@shoeglitch.test`
- City Manager: `cm.memphis@shoeglitch.test`
- Super Admin: `admin@shoeglitch.test`

Seeded cities: **Memphis, Milwaukee, Atlanta**.

---

## 8. Integration Points (Where to Plug In Later)

| Concern | File | Swap |
|---|---|---|
| Auth | `src/lib/session.ts` | Replace `getSession()` with Supabase Auth |
| DB | `src/lib/db.ts` | Replace in-memory Maps with Supabase client |
| Storage | `uploadImage()` in `src/lib/storage.ts` | Replace with Supabase Storage signed URLs |
| Payments | `src/services/orders.ts::chargeOrder()` | Stripe PaymentIntent |
| Shipping (mail-in) | `src/services/orders.ts::createReturnLabel()` | Shippo/EasyPost API |
| Notifications | `src/lib/notify.ts` | Twilio SMS + Resend email |
| Maps / route optimization | `src/lib/assignment.ts` | Mapbox or Google Routes |

---

## 9. Scaling to a National Marketplace

1. **City launch playbook**: HQ clicks "Launch City" → cities.active=true, service areas seeded, pricing copied from template, city manager onboarded. The UI for this is in `/admin/cities`.
2. **Franchise operators**: the `city_managers` table already supports city-scoped permissions. Add a `franchise_id` column and a revenue-share field when you're ready.
3. **Hub routing**: mail-in orders currently route to a single hub per city via `city.hubAddress`. Extend to multi-hub with a `hubs` table keyed by region.
4. **Dispatch**: the assignment engine is a pure function today. Move to a background worker (Inngest / Trigger.dev) that reconsiders assignments on driver location updates.
5. **Dynamic pricing**: `city_service_pricing` already supports overrides; add a `surge_multiplier` column and a cron job to compute it from demand.
6. **Subscriptions / memberships**: add `memberships` table; gate pricing discounts in `quote()` behind `session.membershipTier`.
