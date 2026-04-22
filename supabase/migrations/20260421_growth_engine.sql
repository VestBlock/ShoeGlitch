create extension if not exists vector;

create table if not exists public.growth_leads (
  id uuid primary key default gen_random_uuid(),
  route_path text not null,
  offer text not null,
  name text,
  email text not null,
  phone text,
  zip text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.growth_events (
  id uuid primary key default gen_random_uuid(),
  route_path text not null,
  event_name text not null,
  cta_label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.growth_generated_pages (
  route_path text primary key,
  route_kind text not null,
  category_slug text,
  keyword_slug text,
  service_slug text,
  location_slug text not null,
  neighborhood_slug text,
  payload jsonb not null,
  generated_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.growth_content_chunks (
  id bigserial primary key,
  route_path text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists growth_leads_route_path_idx on public.growth_leads (route_path);
create index if not exists growth_events_route_path_idx on public.growth_events (route_path);
create index if not exists growth_chunks_route_path_idx on public.growth_content_chunks (route_path);

create or replace function public.match_growth_content_chunks(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id bigint,
  route_path text,
  title text,
  body text,
  metadata jsonb,
  similarity float
)
language sql
as $$
  select
    growth_content_chunks.id,
    growth_content_chunks.route_path,
    growth_content_chunks.title,
    growth_content_chunks.body,
    growth_content_chunks.metadata,
    1 - (growth_content_chunks.embedding <=> query_embedding) as similarity
  from public.growth_content_chunks
  where growth_content_chunks.embedding is not null
  order by growth_content_chunks.embedding <=> query_embedding
  limit match_count;
$$;
