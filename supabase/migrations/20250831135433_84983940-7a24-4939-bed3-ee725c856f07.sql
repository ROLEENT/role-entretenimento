-- Fix remaining PL/pgSQL functions only (skip C language functions as they require superuser permissions)

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
begin
  insert into public.profiles (id, user_id, email, role, created_at, updated_at)
  values (new.id, new.id, new.email, 'viewer', now(), now())
  on conflict (user_id) do nothing;
  return new;
end;
$function$;

-- Fix set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- Fix set_updated_by function
CREATE OR REPLACE FUNCTION public.set_updated_by()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix tg_set_slug_only function
CREATE OR REPLACE FUNCTION public.tg_set_slug_only()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
begin
  if new.slug is null or btrim(new.slug::text) = '' then
    new.slug := public.slugify(new.name)::citext;
  end if;
  return new;
end
$function$;

-- Fix tg_set_slug_and_stage_name function
CREATE OR REPLACE FUNCTION public.tg_set_slug_and_stage_name()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
begin
  if new.slug is null or btrim(new.slug::text) = '' then
    new.slug := public.slugify(new.name)::citext;
  end if;
  if new.stage_name is null or btrim(new.stage_name) = '' then
    new.stage_name := new.name;
  end if;
  return new;
end
$function$;