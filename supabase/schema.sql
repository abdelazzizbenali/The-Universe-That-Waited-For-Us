-- ============================================================
--  THE UNIVERSE THAT WAITED FOR US — database schema
--  Run once against the project. RLS is on for every table.
-- ============================================================

-- ---------- progress (owned by the player, readable by the player) ----------
create table if not exists game_progress (
  player_id   uuid primary key references auth.users(id) on delete cascade,
  chapter     smallint    not null default 0,
  segment     smallint    not null default 0,
  checkpoint  jsonb       not null default '{}'::jsonb,
  color_stage smallint    not null default 0,
  aliveness   smallint    not null default 8,
  flags       jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table game_progress enable row level security;

drop policy if exists "own progress" on game_progress;
create policy "own progress" on game_progress
  for all
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);

-- ---------- wishes (owned by nobody the client can reach) ----------
-- The body is stored ENCRYPTED. There is deliberately no SELECT policy:
-- even the author cannot read it back through the REST API. Reads happen
-- only through the reveal-wish Edge Function, and only after unlock_at.
create table if not exists wishes (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid        not null,
  birthday_year smallint    not null,
  sealed_body   text        not null,          -- base64 AES-GCM ciphertext
  iv            text        not null,          -- base64 nonce
  created_at    timestamptz not null default now(),
  unlock_at     timestamptz not null,          -- next birthday, 00:00 local
  opened_at     timestamptz,
  unique (player_id, birthday_year)
);

alter table wishes enable row level security;

-- No policies at all for anon/authenticated => no client can select, insert,
-- update or delete. The Edge Functions use the service role and bypass RLS.

-- A safe, non-revealing view of whether a wish exists and when it opens.
create table if not exists birthday_state (
  player_id     uuid        not null,
  birthday_year smallint    not null,
  sealed        boolean     not null default false,
  unlock_at     timestamptz,
  opened        boolean     not null default false,
  primary key (player_id, birthday_year)
);

alter table birthday_state enable row level security;

drop policy if exists "own birthday state" on birthday_state;
create policy "own birthday state" on birthday_state
  for select
  using (auth.uid() = player_id);

-- birthday_state is written only by the Edge Functions (service role).
