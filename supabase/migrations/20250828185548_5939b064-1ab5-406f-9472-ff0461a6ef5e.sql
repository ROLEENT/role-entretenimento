-- ETAPA 1: LIMPEZA E CORREÇÃO DE POLICIES RLS
-- Limpar todas as policies existentes primeiro
DROP POLICY IF EXISTS "Users can view active artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can create artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can update artists" ON public.artists;
DROP POLICY IF EXISTS "Only admins can delete artists" ON public.artists;

DROP POLICY IF EXISTS "Anyone can view organizers" ON public.organizers;
DROP POLICY IF EXISTS "Authenticated users can create organizers" ON public.organizers;
DROP POLICY IF EXISTS "Authenticated users can update organizers" ON public.organizers;
DROP POLICY IF EXISTS "Only admins can delete organizers" ON public.organizers;

DROP POLICY IF EXISTS "Anyone can view venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can create venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can update venues" ON public.venues;
DROP POLICY IF EXISTS "Only admins can delete venues" ON public.venues;

DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Only admins can delete events" ON public.events;

DROP POLICY IF EXISTS "Anyone can view published highlights" ON public.highlights;
DROP POLICY IF EXISTS "Authenticated users can view all highlights" ON public.highlights;
DROP POLICY IF EXISTS "Authenticated users can create highlights" ON public.highlights;
DROP POLICY IF EXISTS "Authenticated users can update highlights" ON public.highlights;
DROP POLICY IF EXISTS "Only admins can delete highlights" ON public.highlights;

-- Criar funções de RBAC
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_delete()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_current_user_admin();
$$;

-- Recriar policies para artists
CREATE POLICY "artists_select_published" 
  ON public.artists FOR SELECT 
  USING (status = 'active');

CREATE POLICY "artists_select_authenticated" 
  ON public.artists FOR SELECT 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "artists_insert_authenticated" 
  ON public.artists FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "artists_update_authenticated" 
  ON public.artists FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "artists_delete_admin_only" 
  ON public.artists FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Recriar policies para organizers
CREATE POLICY "organizers_select_all" 
  ON public.organizers FOR SELECT 
  USING (true);

CREATE POLICY "organizers_insert_authenticated" 
  ON public.organizers FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "organizers_update_authenticated" 
  ON public.organizers FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "organizers_delete_admin_only" 
  ON public.organizers FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Recriar policies para venues
CREATE POLICY "venues_select_all" 
  ON public.venues FOR SELECT 
  USING (true);

CREATE POLICY "venues_insert_authenticated" 
  ON public.venues FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "venues_update_authenticated" 
  ON public.venues FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "venues_delete_admin_only" 
  ON public.venues FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Recriar policies para events
CREATE POLICY "events_select_published" 
  ON public.events FOR SELECT 
  USING (status = 'active');

CREATE POLICY "events_select_authenticated" 
  ON public.events FOR SELECT 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "events_insert_authenticated" 
  ON public.events FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "events_update_authenticated" 
  ON public.events FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "events_delete_admin_only" 
  ON public.events FOR DELETE 
  TO authenticated
  USING (public.can_delete());

-- Recriar policies para highlights
CREATE POLICY "highlights_select_published" 
  ON public.highlights FOR SELECT 
  USING (published = true);

CREATE POLICY "highlights_select_authenticated" 
  ON public.highlights FOR SELECT 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "highlights_insert_authenticated" 
  ON public.highlights FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "highlights_update_authenticated" 
  ON public.highlights FOR UPDATE 
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "highlights_delete_admin_only" 
  ON public.highlights FOR DELETE 
  TO authenticated
  USING (public.can_delete());