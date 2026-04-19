# Shoe Glitch v0.2 — Setup Guide

This version is wired to **Supabase** for DB + Auth, and **PayPal-ready** (stub in place, needs credentials). Deploys to Vercel when you're ready.

## Prerequisites

- Node 18.17+ (Node 20 recommended)
- A Supabase project with the schema + seed data already applied
- Your Supabase URL, anon key, and service_role key from **Supabase → Settings → API**

## 1. Install

```bash
cd shoe-glitch
npm install
```

## 2. Environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Never commit `.env.local`.** `.gitignore` already excludes it.

## 3. One-time Supabase setup

Go to **Supabase → SQL Editor**. Run these three scripts in order:

### a) `supabase/coupon-fk.sql`
Adds the missing foreign key from `orders.couponCode → coupons.code`.

### b) `supabase/users-rls.sql`
Enables the RLS policies middleware needs to look up a user's role by email.

### c) `supabase/seed-auth-users.sql`
Creates auth.users entries for all 9 demo accounts so the demo login buttons work. All demo users share the password `shoeglitch-demo`.

After running (c), verify in Supabase → Authentication → Users that 9 users exist.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## 5. Test the full flow

1. Go to `/login`
2. Click any demo role button → signs in via Supabase Auth, redirects to that role's dashboard
3. As a customer: click **Book a clean**, enter ZIP `53202` (Milwaukee Downtown), pick service, confirm
4. As a city manager: see the new unassigned order, click a suggested cleaner to assign
5. As that cleaner: open the order, advance status through the pipeline
6. As admin: see the revenue update on the overview, toggle a city on/off, edit pricing

If any step fails, check the Terminal for the Supabase error and the browser console.

## 6. Demo accounts

| Email | Role | Password |
|---|---|---|
| admin@shoeglitch.test | super_admin | shoeglitch-demo |
| cm.milwaukee@shoeglitch.test | city_manager | shoeglitch-demo |
| cm.memphis@shoeglitch.test | city_manager | shoeglitch-demo |
| cm.atlanta@shoeglitch.test | city_manager | shoeglitch-demo |
| cleaner.milwaukee@shoeglitch.test | cleaner | shoeglitch-demo |
| cleaner2.milwaukee@shoeglitch.test | cleaner | shoeglitch-demo |
| cleaner.atlanta@shoeglitch.test | cleaner | shoeglitch-demo |
| customer@shoeglitch.test | customer | shoeglitch-demo |
| maya@shoeglitch.test | customer | shoeglitch-demo |

The demo login buttons on `/login` use these automatically.

## 7. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Add the same env vars from `.env.local` in Vercel → Settings → Environment Variables
4. Deploy
5. Add your custom domain in Vercel → Domains (e.g. shoeglitch.com)
6. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your production URL

## 8. Still to wire (stubs in place)

**PayPal payments.** Replace the stub in `src/services/orders.ts::chargeOrder()`:
- Get Client ID + Secret from developer.paypal.com
- Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE` to env
- Integrate PayPal Smart Buttons in the booking flow

**Supabase Storage for photo uploads.** Replace `addAfterPhotoAction` in `src/app/cleaner/actions.ts`:
- Create a bucket `order-photos` in Supabase Storage
- Use signed upload URLs

**Transactional email.** For order confirmations and status updates:
- Sign up for Resend (resend.com)
- Add to env, wire into `appendEvent()` in `src/services/orders.ts`

## Architecture notes

All files follow the same patterns:
- Reads use `server()` (authenticated Supabase client, RLS applies)
- Writes use `admin()` (service_role, authorized by requireRole() first)
- `users.*` uses admin intentionally — for auth bootstrap + admin views
- Middleware at `src/middleware.ts` refreshes sessions and enforces role-based routing
- Session shape (`{userId, email, name, role, cityId}`) unchanged since v0.1 — still works with all role-gated pages

If anything breaks, the first places to look:
1. `.env.local` — are the Supabase keys correct?
2. Supabase → Authentication → Users — are all 9 demo users there?
3. Supabase → Logs → API — any RLS rejections on your queries?
