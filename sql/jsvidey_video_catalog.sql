-- Jsvidey video catalog categories
-- Run in Supabase SQL Editor. Existing videos default to Trending.
alter table public.videos add column if not exists category text not null default 'Trending';
alter table public.videos add column if not exists thumbnail_url text;
create index if not exists videos_status_created_at_idx on public.videos (status, created_at desc);
create index if not exists videos_category_idx on public.videos (category);
-- Keep the existing RLS policies; do not expose service-role credentials in frontend code.
