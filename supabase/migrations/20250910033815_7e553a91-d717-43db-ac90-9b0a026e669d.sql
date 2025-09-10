-- ETAPA 3: Correção final e consolidação

-- Remover todas as views do esquema público
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
        EXCEPTION 
            WHEN OTHERS THEN
                NULL; -- Ignorar erros
        END;
    END LOOP;
END $$;

-- Criar view corrigida para agenda pública
CREATE VIEW public.agenda_events_public AS
SELECT 
  id, title, subtitle, summary, slug, cover_url, alt_text,
  city, location_name, address, neighborhood,
  starts_at, end_at, price_min, price_max, currency,
  ticket_url, tags, artists_names, highlight_type,
  is_sponsored, patrocinado, status, visibility_type,
  created_at, updated_at, published_at
FROM public.agenda_itens
WHERE status = 'published' 
  AND deleted_at IS NULL 
  AND visibility_type = 'curadoria';

-- Corrigir políticas RLS para admin_users
DROP POLICY IF EXISTS "Allow admin users to update their profile" ON public.admin_users;
DROP POLICY IF EXISTS "Enable read for authenticated admin users" ON public.admin_users;  
DROP POLICY IF EXISTS "Enable update for admin users" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_read_access" ON public.admin_users;

CREATE POLICY "admin_users_access" ON public.admin_users
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.approved_admins WHERE email = admin_users.email AND is_active = true)
);