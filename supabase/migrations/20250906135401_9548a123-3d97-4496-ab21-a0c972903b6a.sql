-- Toggle save de evento
create or replace function public.toggle_save(event_id uuid, collection text default 'default')
returns table(saved boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if exists (select 1 from public.saves s where s.user_id = v_user and s.event_id = toggle_save.event_id and s.collection = toggle_save.collection) then
    delete from public.saves
      where user_id = v_user and event_id = toggle_save.event_id and collection = toggle_save.collection;
    return query select false as saved;
  else
    insert into public.saves (user_id, event_id, collection) values (v_user, toggle_save.event_id, toggle_save.collection);
    return query select true as saved;
  end if;
end;
$$;

-- Definir presença
create or replace function public.set_attendance(p_event_id uuid, p_status public.attendance_status, p_show_publicly boolean default true)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.attendance as a (user_id, event_id, status, show_publicly)
  values (v_user, p_event_id, p_status, coalesce(p_show_publicly, true))
  on conflict (user_id, event_id)
  do update set status = excluded.status, show_publicly = excluded.show_publicly, updated_at = now();
end;
$$;

-- Toggle follow
create or replace function public.toggle_follow(p_entity_type text, p_entity_uuid uuid default null, p_entity_slug text default null)
returns table(following boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  if p_entity_type not in ('artist','venue','organizer','city','tag') then
    raise exception 'invalid entity_type';
  end if;

  if p_entity_type in ('artist','venue','organizer') and p_entity_uuid is null then
    raise exception 'entity_uuid required for this type';
  end if;

  if p_entity_type in ('city','tag') and (p_entity_slug is null or length(p_entity_slug) = 0) then
    raise exception 'entity_slug required for this type';
  end if;

  if exists (
    select 1 from public.follows f
    where f.user_id = v_user
      and f.entity_type = p_entity_type
      and coalesce(f.entity_uuid::text,'') = coalesce(p_entity_uuid::text,'')
      and coalesce(f.entity_slug,'') = coalesce(p_entity_slug,'')
  ) then
    delete from public.follows
    where user_id = v_user
      and entity_type = p_entity_type
      and coalesce(entity_uuid::text,'') = coalesce(p_entity_uuid::text,'')
      and coalesce(entity_slug,'') = coalesce(p_entity_slug,'');
    return query select false as following;
  else
    insert into public.follows(user_id, entity_type, entity_uuid, entity_slug)
    values (v_user, p_entity_type, p_entity_uuid, p_entity_slug);
    return query select true as following;
  end if;
end;
$$;

-- Social do evento com amostra de avatares públicos
create or replace function public.get_event_social(p_event_id uuid, p_limit integer default 12)
returns table(
  going_count bigint,
  maybe_count bigint,
  went_count bigint,
  avatars text[]
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with counts as (
    select
      sum(case when status = 'going' then 1 else 0 end)::bigint as going_count,
      sum(case when status = 'maybe' then 1 else 0 end)::bigint as maybe_count,
      sum(case when status = 'went' then 1 else 0 end)::bigint as went_count
    from public.attendance
    where event_id = p_event_id
  ),
  pics as (
    select up.avatar_url
    from public.attendance a
    join public.users_public up on up.id = a.user_id
    where a.event_id = p_event_id
      and a.show_publicly = true
      and up.is_profile_public = true
      and coalesce(up.avatar_url,'') <> ''
    order by a.updated_at desc
    limit greatest(p_limit, 0)
  )
  select
    counts.going_count,
    counts.maybe_count,
    counts.went_count,
    array(select avatar_url from pics) as avatars
  from counts;
end;
$$;