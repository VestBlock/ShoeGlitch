# Direct SQL Setup

ShoeGlitch now supports direct Postgres access from terminal through `psql`.

## What is already wired

- `DATABASE_URL` lives in `.env.local`
- helper script: `./scripts/db/psql.sh`

## One-time local setup

Install the Postgres client if `psql` is not already available:

```bash
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Open SQL directly

```bash
./scripts/db/psql.sh
```

## Run a quick test query

```bash
./scripts/db/psql.sh -c "select now();"
```

## Run a migration file

```bash
./scripts/db/psql.sh -f supabase/migrations/20260424_service_tiers.sql
```

## Useful examples

Check current services:

```bash
./scripts/db/psql.sh -c 'select id, name, slug, active from public.services order by "createdAt" nulls last;'
```

Inspect recent orders:

```bash
./scripts/db/psql.sh -c 'select id, "fulfillmentType", status, "createdAt" from public.orders order by "createdAt" desc limit 20;'
```

## Notes

- `.env.local` is local-only and should stay out of git.
- Use direct SQL for controlled admin fixes and migrations, not browser-exposed code.
