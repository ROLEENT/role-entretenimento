-- CORREÇÃO COMPLETA DO SISTEMA DE UPLOAD ADMIN-V2
-- Remove todas as políticas RLS conflitantes e cria políticas limpas e consistentes

-- 1. LIMPAR TODAS AS POLÍTICAS CONFLITANTES
DROP POLICY IF EXISTS "Admin can delete organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can manage all highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view highlight images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete event files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update event files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload event files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can view event files" ON storage.objects;

-- 2. CRIAR BUCKETS SE NÃO EXISTIREM
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('events', 'events', true),
  ('venues', 'venues', true),
  ('organizers', 'organizers', true),
  ('highlights', 'highlights', true),
  ('artists', 'artists', true),
  ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 3. CRIAR POLÍTICAS RLS LIMPAS E CONSISTENTES PARA TODOS OS BUCKETS
-- EVENTS
CREATE POLICY "Admin can manage event files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'events' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
)
WITH CHECK (
  bucket_id = 'events' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- VENUES  
CREATE POLICY "Admin can manage venue files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'venues' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
)
WITH CHECK (
  bucket_id = 'venues' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- ORGANIZERS
CREATE POLICY "Admin can manage organizer files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'organizers' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
)
WITH CHECK (
  bucket_id = 'organizers' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- HIGHLIGHTS
CREATE POLICY "Admin can manage highlight files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'highlights' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
)
WITH CHECK (
  bucket_id = 'highlights' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- ARTISTS
CREATE POLICY "Admin can manage artist files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'artists' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
)
WITH CHECK (
  bucket_id = 'artists' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);

-- POSTS  
CREATE POLICY "Admin can manage post files" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'posts' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
)
WITH CHECK (
  bucket_id = 'posts' 
  AND is_admin_session_valid(((current_setting('request.headers', true))::json ->> 'x-admin-email'))
);