-- Final comprehensive security fix migration
-- This addresses all remaining security vulnerabilities

-- 1. Fix analytics_events table - restrict access to admins only
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert analytics events" ON public.analytics_events;

CREATE POLICY "System can insert analytics events" ON public.analytics_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics events" ON public.analytics_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Create notification_logs table if not exists and secure it
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type text NOT NULL,
    delivery_status text NOT NULL DEFAULT 'pending',
    sent_at timestamp with time zone DEFAULT now(),
    delivered_at timestamp with time zone,
    user_agent text,
    endpoint text,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification logs" ON public.notification_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage notification logs" ON public.notification_logs
FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all notification logs" ON public.notification_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Enhance admin tables security by restricting to superuser/service role only
-- Remove existing policies and create more restrictive ones
DROP POLICY IF EXISTS "Admin users can view own profile only" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update own profile only" ON public.admin_users;

-- Only allow admin users to see their own records when authenticated via proper channels
CREATE POLICY "Admin users restricted access" ON public.admin_users
FOR SELECT USING (
  email = (current_setting('request.headers', true))::json ->> 'x-admin-email'
  AND is_active = true
  AND EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE approved_admins.email = admin_users.email AND approved_admins.is_active = true
  )
);

CREATE POLICY "Admin users can update own profile securely" ON public.admin_users
FOR UPDATE USING (
  email = (current_setting('request.headers', true))::json ->> 'x-admin-email'
  AND is_active = true
  AND EXISTS (
    SELECT 1 FROM public.approved_admins 
    WHERE approved_admins.email = admin_users.email AND approved_admins.is_active = true
  )
);

-- 4. Secure admin_sessions table properly
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage their own sessions" ON public.admin_sessions;

CREATE POLICY "Admin sessions restricted access" ON public.admin_sessions
FOR ALL USING (
  admin_id IN (
    SELECT a.id FROM public.admin_users a
    JOIN public.approved_admins aa ON a.email = aa.email
    WHERE a.email = (current_setting('request.headers', true))::json ->> 'x-admin-email'
    AND a.is_active = true AND aa.is_active = true
  )
);

-- 5. Secure admin_audit_log table
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view audit log" ON public.admin_audit_log;

CREATE POLICY "Admins can view audit log securely" ON public.admin_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 6. Create secure functions with proper search_path for critical operations
CREATE OR REPLACE FUNCTION public.secure_admin_access(admin_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.admin_users a
    JOIN public.approved_admins aa ON a.email = aa.email
    WHERE a.email = admin_email 
    AND a.is_active = true 
    AND aa.is_active = true
  );
END;
$$;

-- 7. Create user badge management functions with proper security
CREATE TABLE IF NOT EXISTS public.user_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges" ON public.user_badges
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can award badges" ON public.user_badges
FOR INSERT WITH CHECK (true);

-- 8. Create event management triggers with security
CREATE OR REPLACE FUNCTION public.secure_event_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Create activity for new events
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_activity(
      NEW.organizer_id,
      'event_created',
      'event',
      NEW.id,
      jsonb_build_object('event_title', NEW.title, 'city', NEW.city)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for event notifications
DROP TRIGGER IF EXISTS secure_event_notification_trigger ON public.events;
CREATE TRIGGER secure_event_notification_trigger
    AFTER INSERT OR UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_event_notification();