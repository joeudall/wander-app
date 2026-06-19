-- Run this in Supabase → SQL Editor

create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  guidelines jsonb not null,
  plan jsonb not null,
  status text not null default 'planning' check (status in ('upcoming', 'past', 'planning')),
  emoji text not null default '🗺️',
  card_color text not null default 'blue',
  share_token uuid unique default gen_random_uuid(),
  created_at timestamptz default now()
);

-- Users can only see their own trips
alter table trips enable row level security;

create policy "Users can view own trips"
  on trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on trips for update
  using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on trips for delete
  using (auth.uid() = user_id);

create policy "Anyone can view trips by share token"
  on trips for select
  using (share_token is not null);
