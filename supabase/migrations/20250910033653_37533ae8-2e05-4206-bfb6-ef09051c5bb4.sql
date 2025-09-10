-- ETAPA 2: Remover todas as views com SECURITY DEFINER restantes

-- Encontrar e remover todas as views problemáticas
DROP VIEW IF EXISTS public.agenda_active CASCADE;
DROP VIEW IF EXISTS public.agenda_public CASCADE;
DROP VIEW IF EXISTS public.analytics_summary CASCADE;

-- Corrigir funções sem search_path adequado
CREATE OR REPLACE FUNCTION public.fn_profile_set_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profile_roles(profile_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_event_organizer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Se o evento está sendo publicado, deve ter pelo menos um organizador
  IF NEW.status = 'published' THEN
    IF NEW.organizer_id IS NULL AND NOT EXISTS (
      SELECT 1 FROM public.agenda_item_organizers 
      WHERE agenda_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Eventos publicados devem ter pelo menos um organizador definido';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_entity_profile_name_not_fake()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se é um nome claramente fake/teste
  IF NEW.name ILIKE '%test%' OR 
     NEW.name ILIKE '%fake%' OR 
     NEW.name ILIKE '%dummy%' OR 
     NEW.name ILIKE '%exemplo%' OR
     NEW.handle ILIKE '%test%' OR
     NEW.handle ILIKE '%fake%' THEN
    RAISE EXCEPTION 'Nome de perfil inválido: não é permitido usar nomes de teste';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_by = auth.uid();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_delete_highlight()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_admin_email text DEFAULT NULL::text, p_details jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'info'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_logs (
    event_type, user_id, admin_email, details, severity,
    ip_address, user_agent
  ) VALUES (
    p_event_type, p_user_id, p_admin_email, p_details, p_severity,
    inet_client_addr(), 
    current_setting('request.headers', true)::json ->> 'user-agent'
  );
EXCEPTION WHEN OTHERS THEN
  -- Log errors silently to avoid breaking application flow
  NULL;
END;
$$;