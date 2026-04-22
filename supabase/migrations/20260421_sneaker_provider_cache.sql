create table if not exists public.sneaker_provider_cache (
  cache_key text primary key,
  provider text not null,
  scope text not null,
  query_value text not null,
  payload jsonb not null,
  fetched_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null
);

create index if not exists sneaker_provider_cache_provider_idx
  on public.sneaker_provider_cache (provider, scope);

create index if not exists sneaker_provider_cache_expires_at_idx
  on public.sneaker_provider_cache (expires_at);
