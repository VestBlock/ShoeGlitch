create table if not exists public.social_post_queue (
  id uuid primary key default gen_random_uuid(),
  route_path text not null,
  page_type text not null,
  source_kind text not null,
  content_angle text not null,
  target_platform text not null,
  content_key text not null unique,
  title text not null,
  short_summary text not null,
  hook text not null,
  caption text not null,
  hashtags text[] not null default '{}'::text[],
  image_url text,
  canonical_link text not null,
  publish_date timestamptz,
  source_updated_at timestamptz not null,
  recommended_schedule_at timestamptz not null,
  status text not null default 'draft',
  approval_notes text,
  external_provider text,
  external_post_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz,
  published_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists social_post_queue_route_idx on public.social_post_queue (route_path);
create index if not exists social_post_queue_status_idx on public.social_post_queue (status);
create index if not exists social_post_queue_angle_platform_idx on public.social_post_queue (content_angle, target_platform);
create unique index if not exists social_post_queue_external_post_id_idx
  on public.social_post_queue (external_post_id)
  where external_post_id is not null;
