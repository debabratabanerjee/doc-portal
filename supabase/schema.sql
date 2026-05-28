-- ============================================================
-- DocPortal Demo — Supabase PostgreSQL Schema
-- NOTE: This setup is intended only for demo/POC usage
--       and is not production-secure.
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- File uploads metadata table
create table if not exists public.file_uploads (
  id            uuid primary key default gen_random_uuid(),
  reference_id  text not null,
  client_name   text not null,
  record_year   integer not null,
  user_name     text not null,
  email         text not null,
  file_name     text not null,
  storage_path  text not null,
  uploaded_at   timestamptz not null default now(),
  notes         text,
  uploaded_by   text not null,
  file_size     bigint,
  file_type     text,
  doc_type      text default 'Other',
  request_id    uuid
);

-- Backward-compatible migration for existing projects
alter table public.file_uploads add column if not exists client_name text;
alter table public.file_uploads add column if not exists record_year integer;
alter table public.file_uploads add column if not exists request_id uuid;

update public.file_uploads
set
  client_name = coalesce(client_name, 'Legacy Client'),
  record_year = coalesce(record_year, extract(year from uploaded_at)::integer)
where client_name is null or record_year is null;

alter table public.file_uploads alter column client_name set not null;
alter table public.file_uploads alter column record_year set not null;

-- Index for fast email searches
create index if not exists idx_file_uploads_email        on public.file_uploads (email);
create index if not exists idx_file_uploads_reference_id on public.file_uploads (reference_id);
create index if not exists idx_file_uploads_user_name    on public.file_uploads (user_name);
create index if not exists idx_file_uploads_client_name  on public.file_uploads (client_name);
create index if not exists idx_file_uploads_record_year  on public.file_uploads (record_year desc);
create index if not exists idx_file_uploads_uploaded_at  on public.file_uploads (uploaded_at desc);
create index if not exists idx_file_uploads_doc_type     on public.file_uploads (doc_type);

-- ============================================================
-- Client upload requests table for persistent request storage
-- ============================================================
create table if not exists public.client_upload_requests (
  id            uuid primary key default gen_random_uuid(),
  client_name   text not null,
  title         text not null,
  details       text,
  status        text not null default 'open',
  created_by    text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_client_upload_requests_client_name on public.client_upload_requests (client_name);
create index if not exists idx_client_upload_requests_status on public.client_upload_requests (status);

alter table public.client_upload_requests disable row level security;

-- ============================================================
-- Row Level Security (RLS)
-- For this demo, RLS is disabled to allow open access.
-- In production, implement proper RLS policies.
-- ============================================================
alter table public.file_uploads disable row level security;

-- ============================================================
-- Supabase Storage Bucket
-- Run this or create the bucket manually in the Supabase dashboard:
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('uploads', 'uploads', true)
-- on conflict do nothing;

-- ============================================================
-- Storage policies for private demo access
-- Keep the bucket private and allow only authenticated users.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Uploads: authenticated read" on storage.objects;
create policy "Uploads: authenticated read"
on storage.objects
for select
to authenticated
using (bucket_id = 'uploads');

drop policy if exists "Uploads: authenticated insert" on storage.objects;
create policy "Uploads: authenticated insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'uploads');

drop policy if exists "Uploads: authenticated update" on storage.objects;
create policy "Uploads: authenticated update"
on storage.objects
for update
to authenticated
using (bucket_id = 'uploads')
with check (bucket_id = 'uploads');

drop policy if exists "Uploads: authenticated delete" on storage.objects;
create policy "Uploads: authenticated delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'uploads');
