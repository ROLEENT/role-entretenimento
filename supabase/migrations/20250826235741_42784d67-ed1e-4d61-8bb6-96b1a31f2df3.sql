-- Drop existing validate_admin_email function first
DROP FUNCTION IF EXISTS public.validate_admin_email(text);

-- Now create RLS policies for tables that need them and fix security issues

-- 1. Fix admin_users table - make it only accessible to admins
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create secure admin function first
CREATE OR REPLACE FUNCTION public.validate_admin_email(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.approved_admins 
    WHERE email = user_email AND is_active = true
  );
END;
$$;

-- Policies for admin_users table
DROP POLICY IF EXISTS "Admin users can view own profile only" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update own profile only" ON public.admin_users;

CREATE POLICY "Admin users can view own profile only" ON public.admin_users
FOR SELECT USING (
  email = (current_setting('request.headers', true))::json ->> 'x-admin-email'
  AND is_active = true
);

CREATE POLICY "Admin users can update own profile only" ON public.admin_users
FOR UPDATE USING (
  email = (current_setting('request.headers', true))::json ->> 'x-admin-email'
  AND is_active = true
);

-- 2. Create missing tables and policies for user_music_tokens
CREATE TABLE IF NOT EXISTS public.user_music_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform text NOT NULL,
    access_token text NOT NULL,
    refresh_token text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, platform)
);

ALTER TABLE public.user_music_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own music tokens" ON public.user_music_tokens
FOR ALL USING (auth.uid() = user_id);

-- 3. Create missing table and policies for user_calendar_settings
CREATE TABLE IF NOT EXISTS public.user_calendar_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    google_access_token text,
    google_refresh_token text,
    calendar_id text,
    sync_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_calendar_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own calendar settings" ON public.user_calendar_settings
FOR ALL USING (auth.uid() = user_id);

-- 4. Create missing table and policies for user_notification_preferences
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    event_reminders boolean DEFAULT true,
    weekly_digest boolean DEFAULT true,
    city text,
    daily_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences" ON public.user_notification_preferences
FOR ALL USING (auth.uid() = user_id);

-- 5. Create missing table and policies for push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint text NOT NULL,
    p256dh_key text NOT NULL,
    auth_key text NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- 6. Fix contact_messages table - only admins should see messages
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact messages" ON public.contact_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update contact messages" ON public.contact_messages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);