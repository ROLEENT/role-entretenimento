-- Criar bucket para eventos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-- Criar policies para bucket de eventos
CREATE POLICY "Allow public read access to event images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'events');

CREATE POLICY "Allow admin upload to events bucket"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Allow admin update to events bucket"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);

CREATE POLICY "Allow admin delete from events bucket"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'events' AND
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = ((current_setting('request.headers', true))::json ->> 'x-admin-email') 
    AND is_active = true
  )
);