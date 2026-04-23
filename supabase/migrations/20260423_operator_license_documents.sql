create table if not exists public.operator_application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id text not null references public.operator_applications(id) on delete cascade,
  document_type text not null default 'driver_license',
  file_name text not null,
  content_type text not null,
  file_size bigint not null,
  storage_bucket text not null default 'operator-documents',
  storage_key text not null unique,
  status text not null default 'submitted',
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint operator_application_documents_type_check
    check (document_type in ('driver_license')),
  constraint operator_application_documents_status_check
    check (status in ('submitted', 'verified', 'rejected'))
);

create index if not exists operator_application_documents_application_idx
  on public.operator_application_documents (application_id, created_at desc);

create index if not exists operator_application_documents_status_idx
  on public.operator_application_documents (status);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'operator-documents',
  'operator-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
