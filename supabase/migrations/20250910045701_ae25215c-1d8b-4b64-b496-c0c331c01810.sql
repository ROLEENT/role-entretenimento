-- Correção Crítica de Segurança - Fase 6 (Aplicação Segura)
-- Foco nas funções que podem ser atualizadas sem quebrar dependências

-- Atualizar funções existentes apenas com SET search_path
-- Sem mudança de assinatura para evitar conflitos

-- Função provision_user_profile com search_path
CREATE OR REPLACE FUNCTION public.provision_user_profile()
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
  p public.profiles;
BEGIN
  INSERT INTO public.profiles (user_id, email, role, created_at, updated_at)
  VALUES (uid, auth.email(), 'viewer', now(), now())
  ON CONFLICT (user_id) DO UPDATE
    SET updated_at = now()
  RETURNING * INTO p;
  RETURN p;
END;
$$;

-- Função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Função audit_trigger_function com search_path
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_email text;
  old_json jsonb;
  new_json jsonb;
BEGIN
  -- Get admin email from headers, com fallback para system
  admin_email := COALESCE(
    (current_setting('request.headers', true))::json ->> 'x-admin-email',
    'system'
  );
  
  -- Convert OLD and NEW to jsonb, handling null values
  old_json := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  new_json := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
  
  -- Insert audit record apenas se admin_email estiver disponível
  IF admin_email IS NOT NULL AND admin_email != '' THEN
    INSERT INTO public.admin_audit_log (
      admin_email,
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      ip_address,
      user_agent
    ) VALUES (
      admin_email,
      TG_TABLE_NAME,
      CASE 
        WHEN TG_OP = 'DELETE' THEN (OLD.id)::uuid
        ELSE (NEW.id)::uuid
      END,
      TG_OP,
      old_json,
      new_json,
      inet_client_addr(),
      COALESCE((current_setting('request.headers', true))::json ->> 'user-agent', 'unknown')
    );
  END IF;
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Função auto_approve_blog_comments com search_path
CREATE OR REPLACE FUNCTION public.auto_approve_blog_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Auto-approve all new blog comments
  NEW.is_approved = true;
  RETURN NEW;
END;
$$;

-- Função auto_slugify_events com search_path
CREATE OR REPLACE FUNCTION public.auto_slugify_events()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Auto-generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := fn_slugify(NEW.title);
  END IF;
  
  -- Ensure unique slug
  WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = NEW.slug AND id != COALESCE(NEW.id, gen_random_uuid())) LOOP
    NEW.slug := NEW.slug || '-' || extract(epoch from now())::integer;
  END LOOP;
  
  -- Force is_sponsored when highlight_type is vitrine
  IF NEW.highlight_type = 'vitrine' THEN
    NEW.is_sponsored := true;
  END IF;
  
  -- Set updated_at
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;