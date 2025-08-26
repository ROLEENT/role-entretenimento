-- Create missing tables for security issues and add remaining security functions

-- Create missing tables with proper RLS policies
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

-- Enable RLS on all these tables
ALTER TABLE public.user_music_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create secure policies for user_music_tokens
CREATE POLICY "Users can manage their own music tokens" ON public.user_music_tokens
FOR ALL USING (auth.uid() = user_id);

-- Create secure policies for user_calendar_settings
CREATE POLICY "Users can manage their own calendar settings" ON public.user_calendar_settings
FOR ALL USING (auth.uid() = user_id);

-- Create secure policies for user_notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON public.user_notification_preferences
FOR ALL USING (auth.uid() = user_id);

-- Create secure policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
FOR ALL USING (auth.uid() = user_id);

-- Fix contact_messages table policies - only admins can view, anyone can insert
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

-- Add remaining vulnerable functions with proper search_path

-- 1. Create activity function
CREATE OR REPLACE FUNCTION public.create_activity(
    p_actor_id uuid,
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
    INSERT INTO public.activity_feed (
        user_id, actor_id, type, object_type, object_id, data
    ) VALUES (
        p_actor_id, p_actor_id, p_type, p_object_type, p_object_id, p_data
    ) RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$;

-- 2. Add user points function
CREATE OR REPLACE FUNCTION public.add_user_points(
    p_user_id uuid,
    p_points integer,
    p_activity_type text,
    p_object_id uuid DEFAULT NULL,
    p_description text DEFAULT NULL
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
    -- Create tables if they don't exist
    CREATE TABLE IF NOT EXISTS public.user_points_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        points integer NOT NULL,
        activity_type text NOT NULL,
        object_id uuid,
        description text,
        created_at timestamp with time zone DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.user_points (
        user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        total_points integer DEFAULT 0,
        last_activity timestamp with time zone DEFAULT now(),
        current_streak integer DEFAULT 0,
        level integer DEFAULT 1
    );

    -- Insert into points history
    INSERT INTO public.user_points_history (
        user_id, points, activity_type, object_id, description
    ) VALUES (
        p_user_id, p_points, p_activity_type, p_object_id, p_description
    );

    -- Update user total points
    INSERT INTO public.user_points (user_id, total_points, last_activity)
    VALUES (p_user_id, p_points, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_points = public.user_points.total_points + p_points,
        last_activity = now();
END;
$$;