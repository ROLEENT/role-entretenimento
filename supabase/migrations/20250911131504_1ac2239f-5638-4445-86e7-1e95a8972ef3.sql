-- FASE 1: Limpeza das Políticas RLS na tabela organizers
-- Remove todas as políticas conflitantes e redundantes

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can manage all organizers" ON public.organizers;
DROP POLICY IF EXISTS "Admins can manage organizers new" ON public.organizers; 
DROP POLICY IF EXISTS "Public can view active organizers" ON public.organizers;
DROP POLICY IF EXISTS "Public can view basic organizer info" ON public.organizers;
DROP POLICY IF EXISTS "Public can view organizer safe info" ON public.organizers;
DROP POLICY IF EXISTS "admin write organizers" ON public.organizers;
DROP POLICY IF EXISTS "dev_organizers_all_access" ON public.organizers;
DROP POLICY IF EXISTS "organizers_public_read" ON public.organizers;
DROP POLICY IF EXISTS "organizers_rw" ON public.organizers;
DROP POLICY IF EXISTS "read organizers" ON public.organizers;

-- Create only 2 clean policies using the same pattern as artists
CREATE POLICY "Public can view active organizers" 
ON public.organizers 
FOR SELECT 
USING ((status = 'active' OR status IS NULL) AND is_active = true);

CREATE POLICY "Admins can manage organizers" 
ON public.organizers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email')
    AND is_active = true
  )
);

-- Log the cleanup
INSERT INTO public.admin_audit_log (
  admin_email,
  action,
  table_name,
  new_values
) VALUES (
  'system-rls-cleanup',
  'CLEANUP_RLS_POLICIES',
  'organizers',
  jsonb_build_object(
    'cleanup_reason', 'Remove conflicting policies',
    'timestamp', NOW(),
    'description', 'Cleaned up 10 redundant RLS policies on organizers table'
  )
);