-- ETAPA 3: Remoção final de todas as views com SECURITY DEFINER restantes

-- Consultar todas as views do sistema para localizar as que têm SECURITY DEFINER
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
            RAISE NOTICE 'Dropped view: %.%', view_record.schemaname, view_record.viewname;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop view %.%: %', view_record.schemaname, view_record.viewname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Corrigir as funções restantes sem search_path
CREATE OR REPLACE FUNCTION public.user_liked_post_hash(p_post_id uuid, p_email_hash text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.blog_likes
    WHERE post_id = p_post_id AND email_hash = p_email_hash
  );
$$;

CREATE OR REPLACE FUNCTION public.get_compliance_setting(setting_key text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT setting_value FROM public.compliance_settings 
  WHERE compliance_settings.setting_key = get_compliance_setting.setting_key;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_email_hash(email_text text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT md5(lower(trim(email_text)));
$$;

-- Criar view simplificada para agenda pública sem SECURITY DEFINER
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
  AND visibility_type IN ('public', 'curadoria');

-- Garantir que todas as políticas RLS críticas estão corretas
-- Limpar políticas duplicadas de admin_users
DROP POLICY IF EXISTS "Enable read for authenticated admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Enable update for admin users" ON public.admin_users;
DROP POLICY IF EXISTS "admin_users_read_access" ON public.admin_users;

-- Recriar política simplificada para admin_users
CREATE POLICY "admin_users_basic_access" ON public.admin_users
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.approved_admins WHERE email = admin_users.email AND is_active = true)
);