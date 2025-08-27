-- Continue fixing RLS policies for critical tables that were identified

-- Create missing tables and their RLS policies for user security tokens

-- 1. Create user_music_tokens table if not exists
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

-- Users can only access their own music tokens
CREATE POLICY "Users can manage their own music tokens" ON public.user_music_tokens
FOR ALL USING (auth.uid() = user_id);

-- 2. Create user_calendar_settings table if not exists
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

-- Users can only access their own calendar settings
CREATE POLICY "Users can manage their own calendar settings" ON public.user_calendar_settings
FOR ALL USING (auth.uid() = user_id);

-- 3. Create user_notification_preferences table if not exists  
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

-- Users can only access their own notification preferences
CREATE POLICY "Users can manage their own notification preferences" ON public.user_notification_preferences
FOR ALL USING (auth.uid() = user_id);

-- 4. Create push_subscriptions table if not exists
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

-- Users can only access their own push subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- 5. Fix contact_messages table policies - restrict admin access properly
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;

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

-- Create missing tables for completeness if needed
CREATE TABLE IF NOT EXISTS public.user_points_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points integer NOT NULL,
    activity_type text NOT NULL,
    object_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points history" ON public.user_points_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create points history" ON public.user_points_history
FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_points integer DEFAULT 0,
    current_streak integer DEFAULT 0,
    level integer DEFAULT 1,
    last_activity timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points" ON public.user_points
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user points" ON public.user_points
FOR ALL WITH CHECK (true);