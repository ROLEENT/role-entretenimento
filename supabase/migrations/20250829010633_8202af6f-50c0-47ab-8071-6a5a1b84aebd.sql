-- 1) Campos novos na tabela highlights
alter table public.highlights
  add column if not exists slug text,
  add column if not exists alt_text text,
  add column if not exists focal_point_x numeric,
  add column if not exists focal_point_y numeric,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists noindex boolean default false,
  add column if not exists publish_at timestamptz,
  add column if not exists unpublish_at timestamptz,
  add column if not exists type text,
  add column if not exists patrocinado boolean default false,
  add column if not exists anunciante text,
  add column if not exists cupom text,
  add column if not exists priority int default 0,
  add column if not exists event_id uuid,
  add column if not exists organizer_id uuid,
  add column if not exists venue_id uuid;

-- 2) Relacionamentos opcionais
alter table public.highlights
  add constraint if not exists highlights_event_id_fkey
    foreign key (event_id) references public.events(id) on delete set null,
  add constraint if not exists highlights_organizer_id_fkey
    foreign key (organizer_id) references public.organizers(id) on delete set null,
  add constraint if not exists highlights_venue_id_fkey
    foreign key (venue_id) references public.venues(id) on delete set null;

-- 3) Slug único e case-insensitive
create unique index if not exists highlights_slug_unique_idx
  on public.highlights (lower(slug));

-- 4) Regras de datas
alter table public.highlights
  drop constraint if exists highlights_time_window_chk;
alter table public.highlights
  add constraint highlights_time_window_chk
  check (end_at > start_at + interval '15 minutes');

-- 5) Backfill e harmonização de campos legados
-- title pode não existir. Copiar de event_title se title estiver nulo
update public.highlights
set title = coalesce(title, event_title)
where title is null;

-- cover_url é a fonte da verdade. Se vier vazio mas houver image_url, usar image_url
update public.highlights
set cover_url = coalesce(cover_url, image_url)
where cover_url is null and image_url is not null;

-- priority herda de sort_order quando existir
update public.highlights
set priority = coalesce(priority, sort_order)
where (priority is null or priority = 0) and sort_order is not null;

-- 6) Índices úteis
create index if not exists highlights_updated_at_idx on public.highlights(updated_at desc);
create index if not exists highlights_period_idx on public.highlights(start_at, end_at);
create index if not exists highlights_city_idx on public.highlights(city);
create index if not exists highlights_status_idx on public.highlights(status);

-- 7) Criar bucket de storage para uploads do admin
insert into storage.buckets (id, name, public)
values ('admin-uploads', 'admin-uploads', false)
on conflict (id) do nothing;

-- 8) Políticas RLS para o bucket admin-uploads
create policy if not exists "Admin can upload files"
on storage.objects for insert
with check (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);

create policy if not exists "Admin can view files"
on storage.objects for select
using (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);

create policy if not exists "Admin can update files"
on storage.objects for update
using (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);

create policy if not exists "Admin can delete files"
on storage.objects for delete
using (
  bucket_id = 'admin-uploads' and
  exists (
    select 1 from public.admin_users 
    where email = current_setting('request.headers', true)::json->>'x-admin-email'
    and is_active = true
  )
);