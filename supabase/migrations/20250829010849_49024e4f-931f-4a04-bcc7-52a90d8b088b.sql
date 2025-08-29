-- 1) Campos novos na tabela highlights
alter table public.highlights
  add column if not exists slug text,
  add column if not exists alt_text text,
  add column if not exists focal_point_x numeric default 0.5,
  add column if not exists focal_point_y numeric default 0.5,
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

-- 2) Relacionamentos opcionais (verificar se já existem)
do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'highlights_event_id_fkey') then
    alter table public.highlights
      add constraint highlights_event_id_fkey
        foreign key (event_id) references public.events(id) on delete set null;
  end if;
  
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'highlights_organizer_id_fkey') then
    alter table public.highlights
      add constraint highlights_organizer_id_fkey
        foreign key (organizer_id) references public.organizers(id) on delete set null;
  end if;
  
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'highlights_venue_id_fkey') then
    alter table public.highlights
      add constraint highlights_venue_id_fkey
        foreign key (venue_id) references public.venues(id) on delete set null;
  end if;
end $$;