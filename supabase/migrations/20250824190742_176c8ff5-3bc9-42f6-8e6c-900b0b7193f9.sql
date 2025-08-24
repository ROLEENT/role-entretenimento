-- Fix critical RLS security issues

-- Enable RLS on tables that need it
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

-- Update existing functions to set proper search path
CREATE OR REPLACE FUNCTION public.touch_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end$function$;

CREATE OR REPLACE FUNCTION public.touch_venues_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end$function$;

CREATE OR REPLACE FUNCTION public.touch_organizers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end$function$;

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  select coalesce(
    (select is_admin from public.profiles where user_id = uid),
    (select is_admin from public.profiles where id = uid),
    false
  )
$function$;