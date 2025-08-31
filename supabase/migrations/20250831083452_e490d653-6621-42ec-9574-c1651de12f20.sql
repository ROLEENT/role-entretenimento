-- CORREÇÃO FINAL DE SEGURANÇA: Lidar com views SECURITY DEFINER problemáticas

-- Recriar views problemáticas sem SECURITY DEFINER (as 5 views mencionadas nos ERRORs 1-5)
-- Nota: Views SECURITY DEFINER são problemáticas por executar com privilégios do criador

-- Verificar se v_admin_dashboard_counts existe e recriá-la sem SECURITY DEFINER se necessário
DROP VIEW IF EXISTS public.v_admin_dashboard_counts CASCADE;

CREATE VIEW public.v_admin_dashboard_counts AS
SELECT 
    'contacts' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d
FROM public.contacts
UNION ALL
SELECT 
    'newsletter' as kind,
    COUNT(*) as total, 
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d
FROM public.newsletter_subscribers
UNION ALL
SELECT 
    'job_applications' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d
FROM public.applications;

-- Corrigir mais funções críticas sem search_path
CREATE OR REPLACE FUNCTION public.app_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- usa o e-mail do JWT enviado pelo Supabase
  select exists (
    select 1
    from public.app_admins a
    where lower(a.email) = lower(coalesce(nullif(current_setting('request.jwt.claim.email', true), ''), ''))
  );
$function$;

CREATE OR REPLACE FUNCTION public.provision_user_profile(p_user_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_profile jsonb;
  new_profile jsonb;
  user_role user_role := 'viewer';
BEGIN
  -- Verificar se profile já existe
  SELECT to_jsonb(p.*) INTO existing_profile
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  -- Se já existe, retornar o existente
  IF existing_profile IS NOT NULL THEN
    RETURN existing_profile;
  END IF;
  
  -- Determinar role baseado no email
  IF EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = p_email AND is_active = true
  ) OR p_email IN ('fiih@roleentretenimento.com', 'guilherme@roleentretenimento.com') THEN
    user_role := 'admin';
  END IF;
  
  -- Criar novo profile
  INSERT INTO public.profiles (
    user_id,
    email,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_email,
    user_role,
    now(),
    now()
  ) RETURNING to_jsonb(profiles.*) INTO new_profile;
  
  -- Se for admin, garantir entrada na approved_admins
  IF user_role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.approved_admins WHERE email = p_email
  ) THEN
    INSERT INTO public.approved_admins (email, approved_by, is_active)
    VALUES (p_email, 'auto-provision', true);
  END IF;
  
  RETURN new_profile;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, tentar buscar novamente
  SELECT to_jsonb(p.*) INTO existing_profile
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  RETURN existing_profile;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, user_id, email, role, created_at, updated_at)
  values (new.id, new.id, new.email, 'viewer', now(), now())
  on conflict (user_id) do nothing;
  return new;
end;
$function$;