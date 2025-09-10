-- CRITICAL SECURITY FIX: Implement RLS policies for exposed admin tables
-- Phase 5A: Security-First Implementation

-- 1. Enable RLS on user_profiles table (currently exposed)
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin access to user_profiles (secure)
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (public.is_admin_user());

-- 2. Secure analytics_events table (contains sensitive tracking data)
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" 
ON public.analytics_events 
FOR ALL 
USING (public.is_admin_user());

-- 3. Secure user_sessions table (authentication data)
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" 
ON public.user_sessions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions for moderation" 
ON public.user_sessions 
FOR SELECT 
USING (public.is_admin_user());

-- 4. Secure user_preferences table (personal settings)
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- 5. Secure payment_transactions table (financial data)
ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions for support" 
ON public.payment_transactions 
FOR SELECT 
USING (public.is_admin_user());

-- 6. Fix remaining functions without search_path
CREATE OR REPLACE FUNCTION public.toggle_event_favorite(p_event_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.saved_events 
    WHERE user_id = v_user AND event_id = p_event_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.saved_events 
    WHERE user_id = v_user AND event_id = p_event_id;
    RETURN false;
  ELSE
    INSERT INTO public.saved_events (user_id, event_id)
    VALUES (v_user, p_event_id);
    RETURN true;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_event_status(p_event_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'is_saved', EXISTS(
      SELECT 1 FROM public.saved_events 
      WHERE user_id = auth.uid() AND event_id = p_event_id
    ),
    'is_attending', EXISTS(
      SELECT 1 FROM public.attendance 
      WHERE user_id = auth.uid() AND event_id = p_event_id
    ),
    'has_reviewed', EXISTS(
      SELECT 1 FROM public.event_reviews 
      WHERE user_id = auth.uid() AND event_id = p_event_id
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.update_event_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update event metrics when interactions change
  IF TG_TABLE_NAME = 'saved_events' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.events 
      SET save_count = save_count + 1 
      WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.events 
      SET save_count = GREATEST(save_count - 1, 0) 
      WHERE id = OLD.event_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_username text, p_display_name text, p_avatar_url text, p_bio text, p_city_preferences text[], p_genre_preferences text[], p_accessibility_notes text, p_is_profile_public boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Insert or update user profile
  INSERT INTO public.profiles (
    user_id, username, display_name, avatar_url, bio, 
    city_preferences, genre_preferences, accessibility_notes, is_profile_public
  ) VALUES (
    current_user_id, p_username, p_display_name, p_avatar_url, p_bio,
    p_city_preferences, p_genre_preferences, p_accessibility_notes, p_is_profile_public
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    city_preferences = EXCLUDED.city_preferences,
    genre_preferences = EXCLUDED.genre_preferences,
    accessibility_notes = EXCLUDED.accessibility_notes,
    is_profile_public = EXCLUDED.is_profile_public,
    updated_at = NOW();
END;
$$;

-- 7. Log this critical security fix
PERFORM log_security_event(
  'critical_rls_policies_implemented',
  auth.uid(),
  'system',
  jsonb_build_object(
    'tables_secured', ARRAY['user_profiles', 'analytics_events', 'user_sessions', 'user_preferences', 'payment_transactions'],
    'functions_hardened', 4,
    'timestamp', NOW()
  ),
  'info'
);

-- 8. Comment for audit trail
COMMENT ON POLICY "Users can view their own profile" ON public.user_profiles IS 'Critical security fix - Phase 5A: Restricts profile access to owners only';
COMMENT ON POLICY "Admins can view all analytics" ON public.analytics_events IS 'Critical security fix - Phase 5A: Admin access for legitimate analytics needs only';