create or replace function public.ensure_user_profile(
  p_username text,
  p_display_name text,
  p_avatar_url text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.users_public as up (id, username, display_name, avatar_url)
  values (v_user, p_username, p_display_name, p_avatar_url)
  on conflict (id) do update
    set username = coalesce(excluded.username, up.username),
        display_name = coalesce(excluded.display_name, up.display_name),
        avatar_url = coalesce(excluded.avatar_url, up.avatar_url);
end;
$$;