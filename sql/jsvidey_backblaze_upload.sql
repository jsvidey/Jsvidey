-- Run in Supabase SQL Editor after sql/jsvidey_dashboard.sql.
-- Stores Backblaze object metadata on each video row. File bytes are uploaded directly to B2.
alter table public.videos add column if not exists storage_key text;
alter table public.videos add column if not exists file_size_bytes bigint;
alter table public.videos add column if not exists mime_type text;

alter table public.videos drop constraint if exists videos_file_size_bytes_check;
alter table public.videos add constraint videos_file_size_bytes_check
  check (file_size_bytes is null or (file_size_bytes > 0 and file_size_bytes < 20971520));

create index if not exists videos_storage_key_idx on public.videos(storage_key) where storage_key is not null;
