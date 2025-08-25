-- Verificar e corrigir função is_admin(auth.uid())
DROP FUNCTION IF EXISTS public.is_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = uid),
    (SELECT is_admin FROM public.profiles WHERE id = uid),
    false
  )
$$;

-- Verificar triggers de updated_at para profiles, venues e organizers
DROP TRIGGER IF EXISTS touch_profiles_updated_at ON public.profiles;
CREATE TRIGGER touch_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_profiles_updated_at();

DROP TRIGGER IF EXISTS touch_venues_updated_at ON public.venues;
CREATE TRIGGER touch_venues_updated_at
    BEFORE UPDATE ON public.venues
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_venues_updated_at();

DROP TRIGGER IF EXISTS touch_organizers_updated_at ON public.organizers;
CREATE TRIGGER touch_organizers_updated_at
    BEFORE UPDATE ON public.organizers
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_organizers_updated_at();