-- Migração final para corrigir problemas de segurança críticos

-- 1. PRIMEIRO REMOVER FUNÇÕES EXISTENTES E RECRIAR COM search_path CORRETO

-- Drop existing functions that need search_path fix
DROP FUNCTION IF EXISTS public.create_activity(uuid,text,text,uuid,jsonb);
DROP FUNCTION IF EXISTS public.add_user_points(uuid,integer,text,uuid,text);
DROP FUNCTION IF EXISTS public.reset_daily_notification_count();
DROP FUNCTION IF EXISTS public.validate_admin_email(text);

-- Recriar função create_activity com search_path seguro
CREATE OR REPLACE FUNCTION public.create_activity(
  p_user_id uuid,
  p_type text,
  p_object_type text DEFAULT NULL,
  p_object_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO public.activity_feed (user_id, actor_id, type, object_type, object_id, data)
  VALUES (p_user_id, p_user_id, p_type, p_object_type, p_object_id, p_data)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Recriar função validate_admin_email com search_path seguro
CREATE OR REPLACE FUNCTION public.validate_admin_email(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = email_to_check AND is_active = true
  );
END;
$$;

-- 2. RESOLVER SECURITY DEFINER VIEW
DROP VIEW IF EXISTS public.analytics_summary CASCADE;

-- Recriar como view normal (sem SECURITY DEFINER)
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    event_name,
    city,
    source,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users
FROM public.analytics_events 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), event_name, city, source
ORDER BY date DESC;

-- 3. CRIAR TABELAS DE SISTEMA DE PONTOS COM POLÍTICAS RLS

-- Tabela user_points_history - proteger histórico de pontos
CREATE TABLE IF NOT EXISTS public.user_points_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points_awarded integer NOT NULL,
    source text NOT NULL,
    reference_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_points_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own points history" ON public.user_points_history;
CREATE POLICY "Users can view their own points history" ON public.user_points_history
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create points history" ON public.user_points_history;
CREATE POLICY "System can create points history" ON public.user_points_history
FOR INSERT WITH CHECK (true);

-- Tabela user_points - proteger pontos totais dos usuários  
CREATE TABLE IF NOT EXISTS public.user_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points integer DEFAULT 0,
    current_streak integer DEFAULT 0,
    level integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own points" ON public.user_points;
CREATE POLICY "Users can view their own points" ON public.user_points
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage user points" ON public.user_points;
CREATE POLICY "System can manage user points" ON public.user_points
FOR ALL WITH CHECK (true);

-- Recriar função add_user_points com search_path seguro
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id uuid,
  p_points integer,
  p_source text,
  p_reference_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into user_points_history
  INSERT INTO public.user_points_history (
    user_id, points_awarded, source, reference_id, description
  ) VALUES (
    p_user_id, p_points, p_source, p_reference_id, p_description
  );
  
  -- Update or create user_points record
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_points.total_points + p_points,
    updated_at = now();
END;
$$;

-- 4. SISTEMA DE EVENTOS SEGURO

-- Função segura para criar eventos
CREATE OR REPLACE FUNCTION public.create_event_secure(
  p_title text,
  p_description text,
  p_city text,
  p_state text,
  p_date_start timestamp with time zone,
  p_venue_id uuid DEFAULT NULL,
  p_organizer_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_id uuid;
  user_role user_role;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get user role
  SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
  
  -- Check permissions
  IF user_role NOT IN ('admin', 'organizer') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Create event
  INSERT INTO public.events (
    title, description, city, state, date_start, venue_id, organizer_id, status
  ) VALUES (
    p_title, p_description, p_city, p_state, p_date_start, p_venue_id, p_organizer_id, 'active'
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- 5. PROTEGER DADOS SENSÍVEIS DE PERFIS

-- Função para dados públicos de perfil
CREATE OR REPLACE FUNCTION public.get_profile_public(p_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  followers_count integer,
  following_count integer,
  is_verified boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.followers_count,
    p.following_count,
    p.is_verified
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
$$;

-- Função segura para organizadores (apenas dados públicos)
CREATE OR REPLACE FUNCTION public.get_organizer_safe(p_organizer_id uuid)
RETURNS TABLE(id uuid, name text, site text, instagram text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    o.id,
    o.name,
    o.site,
    o.instagram
  FROM public.organizers o
  WHERE o.id = p_organizer_id;
$$;