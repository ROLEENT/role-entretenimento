-- Criar esquema de perfis com seguidores e papéis

-- tabela principal
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('artista','local','organizador')),
  handle text not null unique,
  name text not null,
  city text not null,
  state text not null,
  country text not null default 'BR',
  bio_short text not null default '',
  bio text,
  avatar_url text,
  cover_url text,
  tags text[] default '{}',
  links jsonb default '[]',
  contact_email text,
  contact_phone text,
  visibility text not null default 'public' check (visibility in ('public','draft','private')),
  verified boolean not null default false,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

-- regras de handle
alter table public.profiles
  add constraint handle_format check (handle ~ '^[a-z0-9.]{3,30}$');

create unique index if not exists idx_profiles_handle on public.profiles(lower(handle));

-- dados específicos em tabelas filhas
create table if not exists public.profile_artist (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  genres text[] not null default '{}',
  agency text,
  touring_city text,
  fee_band text check (fee_band in ('<=2k','2-5k','5-10k','10k+')),
  rider_url text,
  stageplot_url text,
  presskit_url text,
  spotify_id text,
  soundcloud_url text,
  youtube_url text,
  pronoun text
);

create table if not exists public.profile_venue (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  address jsonb,           -- rua, numero, bairro, cep
  lat numeric, lon numeric,
  place_id text,
  capacity int not null,
  hours jsonb,             -- por dia da semana
  price_range text check (price_range in ('$','$$','$$$')),
  accessibility jsonb,     -- rampas, banheiro, etc
  age_policy text not null, -- ex 18+
  sound_gear jsonb,
  cnpj text
);

create table if not exists public.profile_org (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  brand_name text,
  cnpj text,
  manager_name text,
  manager_email text,
  manager_phone text,
  cities text[],
  about text
);

-- papéis
create table if not exists public.profile_roles (
  profile_id uuid references public.profiles(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','editor')),
  created_at timestamptz not null default now(),
  primary key (profile_id, user_id)
);

-- seguidores
create table if not exists public.followers (
  profile_id uuid references public.profiles(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, user_id)
);

-- stats materializadas por view
create or replace view public.profile_stats as
select
  p.id as profile_id,
  coalesce(f.cnt,0)::int as followers_count,
  coalesce(e.cnt,0)::int as upcoming_events_count
from public.profiles p
left join lateral (
  select count(*) cnt from public.followers f where f.profile_id = p.id
) f on true
left join lateral (
  select count(*) cnt
  from public.events ev
  where ev.profile_id = p.id and ev.starts_at >= now()
) e on true;

-- ao criar perfil, criador vira owner
create or replace function public.fn_profile_set_owner()
returns trigger language plpgsql as $$
begin
  insert into public.profile_roles(profile_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists trg_profile_set_owner on public.profiles;
create trigger trg_profile_set_owner
after insert on public.profiles
for each row execute function public.fn_profile_set_owner();

-- RLS e grants
alter table public.profiles enable row level security;
alter table public.profile_artist enable row level security;
alter table public.profile_venue enable row level security;
alter table public.profile_org enable row level security;
alter table public.profile_roles enable row level security;
alter table public.followers enable row level security;

-- leitura pública
create policy profiles_read on public.profiles for select to anon, authenticated using (true);
create policy artist_read   on public.profile_artist for select to anon, authenticated using (true);
create policy venue_read    on public.profile_venue  for select to anon, authenticated using (true);
create policy org_read      on public.profile_org    for select to anon, authenticated using (true);
create policy followers_read on public.followers for select to anon, authenticated using (true);
create policy roles_read on public.profile_roles for select to authenticated using (true);

-- criar perfil: usuário autenticado
create policy profiles_insert on public.profiles for insert to authenticated with check (created_by = auth.uid());

-- editar perfil: owner ou editor
create policy profiles_update on public.profiles for update
  to authenticated
  using (exists (select 1 from public.profile_roles r where r.profile_id = id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.profile_roles r where r.profile_id = id and r.user_id = auth.uid()));

-- update nas tabelas filhas pelo mesmo critério
create policy artist_upd on public.profile_artist for all to authenticated
  using (exists (select 1 from public.profile_roles r where r.profile_id = profile_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.profile_roles r where r.profile_id = profile_id and r.user_id = auth.uid()));

create policy venue_upd on public.profile_venue for all to authenticated
  using (exists (select 1 from public.profile_roles r where r.profile_id = profile_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.profile_roles r where r.profile_id = profile_id and r.user_id = auth.uid()));

create policy org_upd on public.profile_org for all to authenticated
  using (exists (select 1 from public.profile_roles r where r.profile_id = profile_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.profile_roles r where r.profile_id = profile_id and r.user_id = auth.uid()));

-- follow e unfollow
create policy followers_ins on public.followers for insert to authenticated
  with check (auth.uid() = user_id);
create policy followers_del on public.followers for delete to authenticated
  using (auth.uid() = user_id);

-- grants
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;