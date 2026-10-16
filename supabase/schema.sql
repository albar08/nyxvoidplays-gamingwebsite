-- Supabase starter schema for NyxVoid Plays
-- Run this in the Supabase SQL editor.

create extension if not exists "uuid-ossp";

create table if not exists public.highlights (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  link text,
  image_url text,
  sort_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.updates (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  text text not null,
  image_url text,
  video_url text,
  type text not null default 'video',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists highlights_order_idx on public.highlights (sort_order);
create index if not exists updates_created_idx on public.updates (created_at desc);

-- Storage bucket for public images/videos
-- Create a bucket named "media" in Supabase Storage and set it to public.
-- Then the public URL can be used directly in the frontend.

-- Optional row-level security policies.
-- You can enable them later after the admin login is working.
-- Example (adjust to your auth policy):
-- alter table public.highlights enable row level security;
-- alter table public.updates enable row level security;

-- create policy "Anyone can read highlights"
-- on public.highlights for select using (true);

-- create policy "Anyone can read updates"
-- on public.updates for select using (true);

-- create policy "Admin can manage highlights"
-- on public.highlights for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- create policy "Admin can manage updates"
-- on public.updates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
