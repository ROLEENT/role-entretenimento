-- Corrigir função is_admin usando CASCADE para remover dependências
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

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

-- Recriar as policies que dependiam da função is_admin
DROP POLICY IF EXISTS "reviews_admin_all" ON public.event_reviews;
CREATE POLICY "reviews_admin_all" 
ON public.event_reviews 
FOR ALL 
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "venues_write_admin" ON public.venues;
CREATE POLICY "venues_write_admin" 
ON public.venues 
FOR ALL 
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "organizers_write_admin" ON public.organizers;
CREATE POLICY "organizers_write_admin" 
ON public.organizers 
FOR ALL 
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "events_write_admin" ON public.events;
CREATE POLICY "events_write_admin" 
ON public.events 
FOR ALL 
USING (is_admin(auth.uid()));