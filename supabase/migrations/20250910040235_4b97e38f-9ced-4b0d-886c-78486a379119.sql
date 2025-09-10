-- Create the admin dashboard counts view
CREATE OR REPLACE VIEW v_admin_dashboard_counts AS
WITH contact_counts AS (
  SELECT 
    'contacts' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as last_7d
  FROM contacts
),
newsletter_counts AS (
  SELECT 
    'newsletter' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as last_7d
  FROM newsletter_subscribers
),
application_counts AS (
  SELECT 
    'job_applications' as kind,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as last_7d
  FROM applications
)
SELECT kind, total, last_7d FROM contact_counts
UNION ALL
SELECT kind, total, last_7d FROM newsletter_counts
UNION ALL
SELECT kind, total, last_7d FROM application_counts;

-- Fix all functions with missing search_path
CREATE OR REPLACE FUNCTION is_admin_session_valid(session_token text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admin_sessions s
    JOIN admin_users u ON s.admin_id = u.id
    WHERE s.session_token = $1
    AND s.expires_at > now()
    AND u.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION log_security_event(
  event_type text,
  details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO security_events (
    event_type,
    details,
    ip_address,
    user_agent
  ) VALUES (
    event_type,
    details,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$;

CREATE OR REPLACE FUNCTION check_user_is_editor_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION auth_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM user_profiles WHERE user_id = auth.uid()),
    'viewer'
  );
$$;

CREATE OR REPLACE FUNCTION reset_daily_notification_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE user_profiles 
  SET daily_notifications_sent = 0
  WHERE daily_notifications_sent > 0;
END;
$$;

CREATE OR REPLACE FUNCTION user_liked_event(user_uuid uuid, event_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_event_likes 
    WHERE user_id = user_uuid AND event_id = event_uuid
  );
$$;

CREATE OR REPLACE FUNCTION create_activity(
  p_type text,
  p_actor_id uuid,
  p_object_type text DEFAULT NULL,
  p_object_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  activity_id uuid;
BEGIN
  INSERT INTO activity_feed (
    type,
    actor_id,
    user_id,
    object_type,
    object_id,
    data
  ) VALUES (
    p_type,
    p_actor_id,
    p_actor_id,
    p_object_type,
    p_object_id,
    p_data
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;