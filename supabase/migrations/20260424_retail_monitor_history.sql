create table if not exists public.retail_monitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  generated_at timestamptz not null,
  entry_count integer not null default 0,
  health jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists retail_monitor_snapshots_generated_at_idx
  on public.retail_monitor_snapshots (generated_at desc);

create table if not exists public.retail_monitor_entries (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.retail_monitor_snapshots(id) on delete cascade,
  entry_id text not null,
  source text not null,
  source_label text not null,
  brand text not null,
  model text not null,
  name text not null,
  colorway text,
  sku text,
  url text not null,
  image_url text,
  release_date timestamptz,
  detected_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists retail_monitor_entries_snapshot_idx
  on public.retail_monitor_entries (snapshot_id, source);

create index if not exists retail_monitor_entries_entry_idx
  on public.retail_monitor_entries (entry_id, source);

create table if not exists public.retail_monitor_diffs (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.retail_monitor_snapshots(id) on delete cascade,
  source text not null,
  source_label text not null,
  entry_id text,
  diff_kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint retail_monitor_diffs_kind_check
    check (diff_kind in ('new', 'returned', 'missing'))
);

create index if not exists retail_monitor_diffs_snapshot_idx
  on public.retail_monitor_diffs (snapshot_id, created_at desc);

create index if not exists retail_monitor_diffs_source_idx
  on public.retail_monitor_diffs (source, diff_kind, created_at desc);
