-- ============================================================
-- SONIK – Supabase Database Schema
-- Run this in the Supabase SQL Editor (dashboard > SQL Editor)
-- ============================================================

-- Users table (auth.users is managed by Supabase Auth)
-- We only need a public profile extension if desired. Favorites references auth.users directly.

-- ── favorites ────────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  event_id    text not null,        -- Ticketmaster event ID
  created_at  timestamptz not null default now(),
  unique (user_id, event_id)
);

-- Row Level Security
alter table public.favorites enable row level security;

-- Users can only read / write their own favorites
create policy "own favorites read"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "own favorites insert"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "own favorites delete"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ── (optional) user_profiles ─────────────────────────────────────────────────
create table if not exists public.user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  favorite_genres text[],           -- e.g. ARRAY['Rock', 'Electronic']
  city          text,
  updated_at    timestamptz default now()
);

alter table public.user_profiles enable row level security;

create policy "own profile read"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "own profile upsert"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "own profile update"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ── Seed demo data (favorites won't work without a real auth user) ───────────
-- Insert a demo event cache row if you want to persist events locally:
-- (optional – SONIK fetches live from Ticketmaster, no local cache required)
