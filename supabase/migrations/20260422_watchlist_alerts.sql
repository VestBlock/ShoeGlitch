create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  brand text not null,
  model text not null,
  name text,
  colorway text,
  sku text,
  size text,
  target_price numeric,
  alert_type text not null default 'any',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists watchlist_items_user_id_idx on public.watchlist_items (user_id, is_active);
create index if not exists watchlist_items_sku_idx on public.watchlist_items (sku);

create table if not exists public.sneaker_events (
  id text primary key,
  source text not null,
  source_event_key text not null unique,
  event_type text not null,
  name text not null,
  brand text not null,
  model text not null,
  colorway text,
  sku text,
  size text,
  price numeric,
  currency text not null default 'USD',
  image_url text,
  market_url text,
  event_date timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists sneaker_events_source_idx on public.sneaker_events (source, event_type, event_date desc);
create index if not exists sneaker_events_sku_idx on public.sneaker_events (sku);

create table if not exists public.source_match_records (
  id uuid primary key default gen_random_uuid(),
  watchlist_item_id uuid not null references public.watchlist_items(id) on delete cascade,
  sneaker_event_id text not null references public.sneaker_events(id) on delete cascade,
  match_type text not null,
  match_score numeric not null,
  explanation text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists source_match_records_watchlist_idx on public.source_match_records (watchlist_item_id, created_at desc);
create index if not exists source_match_records_event_idx on public.source_match_records (sneaker_event_id);

create table if not exists public.alert_deliveries (
  id uuid primary key default gen_random_uuid(),
  watchlist_item_id uuid not null references public.watchlist_items(id) on delete cascade,
  sneaker_event_id text not null references public.sneaker_events(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  channel text not null default 'email',
  provider text not null default 'resend',
  delivery_key text not null unique,
  status text not null default 'sent',
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists alert_deliveries_user_id_idx on public.alert_deliveries (user_id, created_at desc);
create index if not exists alert_deliveries_watchlist_idx on public.alert_deliveries (watchlist_item_id, created_at desc);
