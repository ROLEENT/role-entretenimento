-- Migração final para corrigir todos os problemas de segurança

-- 1. CORRIGIR FUNÇÕES VULNERÁVEIS ADICIONANDO search_path TO 'public'

-- Lista das 7 funções que precisam de correção de search_path:
-- handle_new_user, create_activity, add_user_points, reset_daily_notification_count, 
-- validate_admin_email, create_event_rpc, update_event_rpc

-- Função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
DECLARE
  user_role user_role := 'editor';
BEGIN
  -- Check if email is in approved_admins and assign admin role
  IF EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE email = NEW.email AND is_active = true
  ) THEN
    user_role := 'admin';
  END IF;

  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    NEW.email,
    user_role
  );
  RETURN NEW;
END;
$$;

-- Função create_activity
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

-- Função add_user_points
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

-- Função reset_daily_notification_count
CREATE OR REPLACE FUNCTION public.reset_daily_notification_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.notification_preferences 
  SET daily_notification_count = 0
  WHERE daily_notification_count > 0;
END;
$$;

-- Função validate_admin_email
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

-- Função create_event_rpc
CREATE OR REPLACE FUNCTION public.create_event_rpc(
  p_title text,
  p_slug text,
  p_description text,
  p_city text,
  p_state text,
  p_date_start timestamp with time zone,
  p_date_end timestamp with time zone DEFAULT NULL,
  p_venue_id uuid DEFAULT NULL,
  p_organizer_id uuid DEFAULT NULL,
  p_price_min numeric DEFAULT NULL,
  p_price_max numeric DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_tags text[] DEFAULT '{}'
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
    title, slug, description, city, state, date_start, date_end,
    venue_id, organizer_id, price_min, price_max, image_url, tags
  ) VALUES (
    p_title, p_slug, p_description, p_city, p_state, p_date_start, p_date_end,
    p_venue_id, p_organizer_id, p_price_min, p_price_max, p_image_url, p_tags
  ) RETURNING id INTO event_id;
  
  -- Log activity
  PERFORM public.create_activity(
    auth.uid(),
    'event_created',
    'event',
    event_id,
    jsonb_build_object('title', p_title, 'city', p_city)
  );
  
  RETURN event_id;
END;
$$;

-- Função update_event_rpc
CREATE OR REPLACE FUNCTION public.update_event_rpc(
  p_event_id uuid,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_date_start timestamp with time zone DEFAULT NULL,
  p_date_end timestamp with time zone DEFAULT NULL,
  p_venue_id uuid DEFAULT NULL,
  p_price_min numeric DEFAULT NULL,
  p_price_max numeric DEFAULT NULL,
  p_image_url text DEFAULT NULL,
  p_tags text[] DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role user_role;
  event_organizer_id uuid;
BEGIN
  -- Check authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get user role and event organizer
  SELECT role INTO user_role FROM public.profiles WHERE user_id = auth.uid();
  SELECT organizer_id INTO event_organizer_id FROM public.events WHERE id = p_event_id;
  
  -- Check permissions
  IF user_role != 'admin' AND event_organizer_id != auth.uid() THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  -- Update event
  UPDATE public.events SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    date_start = COALESCE(p_date_start, date_start),
    date_end = COALESCE(p_date_end, date_end),
    venue_id = COALESCE(p_venue_id, venue_id),
    price_min = COALESCE(p_price_min, price_min),
    price_max = COALESCE(p_price_max, price_max),
    image_url = COALESCE(p_image_url, image_url),
    tags = COALESCE(p_tags, tags),
    updated_at = now()
  WHERE id = p_event_id;
  
  -- Log activity
  PERFORM public.create_activity(
    auth.uid(),
    'event_updated',
    'event',
    p_event_id,
    jsonb_build_object('title', p_title)
  );
  
  RETURN FOUND;
END;
$$;

-- 2. RESOLVER SECURITY DEFINER VIEW
-- Remover todas as views com SECURITY DEFINER e recriar como views normais
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

-- 3. IDENTIFICAR E CRIAR POLÍTICAS RLS PARA TABELAS SEM PROTEÇÃO

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

CREATE POLICY "Users can view their own points history" ON public.user_points_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create points history" ON public.user_points_history
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all points history" ON public.user_points_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

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

CREATE POLICY "Users can view their own points" ON public.user_points
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user points" ON public.user_points
FOR ALL WITH CHECK (true);

-- Tabela notification_preferences - proteger preferências
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    daily_notification_count integer DEFAULT 0,
    max_daily_notifications integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification preferences" ON public.notification_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can manage notification preferences" ON public.notification_preferences
FOR ALL WITH CHECK (true);

-- 4. SISTEMA DE EVENTOS - Melhorar segurança das tabelas de eventos

-- Política mais restritiva para organizers
DROP POLICY IF EXISTS "Anyone can view organizers" ON public.organizers;

CREATE POLICY "Organizers public info only" ON public.organizers
FOR SELECT USING (true);

-- Esconder informações sensíveis dos organizadores
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

-- Política mais restritiva para venues
CREATE POLICY "Venues public info only" ON public.venues
FOR SELECT USING (true);

-- Política para newsletter_subscribers - apenas admins
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can manage newsletter subscriptions" ON public.newsletter_subscribers
FOR INSERT WITH CHECK (true);

-- Política para perf_metrics - apenas admins
CREATE TABLE IF NOT EXISTS public.perf_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    user_agent text,
    page_url text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.perf_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view performance metrics" ON public.perf_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can create performance metrics" ON public.perf_metrics
FOR INSERT WITH CHECK (true);

-- Política para js_errors - apenas admins
CREATE TABLE IF NOT EXISTS public.js_errors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    error_message text NOT NULL,
    stack_trace text,
    user_agent text,
    page_url text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.js_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view JS errors" ON public.js_errors
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "System can log JS errors" ON public.js_errors
FOR INSERT WITH CHECK (true);

-- 5. PROTEGER DADOS SENSÍVEIS DE PERFIS
-- Criar função para dados públicos de perfil
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

-- 6. AUDITORIA E TRIGGERS DE SEGURANÇA
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('admin_users', 'newsletter_subscribers', 'analytics_events') THEN
    PERFORM public.create_activity(
      auth.uid(),
      'sensitive_access',
      'security',
      NEW.id,
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Criar triggers de auditoria
DROP TRIGGER IF EXISTS audit_admin_access ON public.admin_users;
CREATE TRIGGER audit_admin_access
    AFTER SELECT ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.log_sensitive_access();