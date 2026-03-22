-- Table pour sauvegarder les salons CatCity des utilisateurs
-- Le champ is_public permettra à terme la visite des mondes des autres

create table if not exists cat_city_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  map_id text not null default 'salon',
  furniture jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  room_name text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  -- Un seul salon par map par utilisateur
  unique(user_id, map_id)
);

-- Index pour les requêtes de visite (futurs)
create index if not exists idx_cat_city_rooms_public on cat_city_rooms (is_public) where is_public = true;
create index if not exists idx_cat_city_rooms_user on cat_city_rooms (user_id);

-- RLS : chaque utilisateur voit ses propres salons + les salons publics
alter table cat_city_rooms enable row level security;

create policy "Users can manage their own rooms"
  on cat_city_rooms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can view public rooms"
  on cat_city_rooms for select
  using (is_public = true);

-- Auto-update du timestamp
create or replace function update_cat_city_rooms_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cat_city_rooms_updated_at
  before update on cat_city_rooms
  for each row execute function update_cat_city_rooms_updated_at();
