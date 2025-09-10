-- Add missing columns to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS favorite_cities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite_genres TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS price_range_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_range_max INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS weekly_newsletter BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS event_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS show_attended_events BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS accessibility_needs TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Rename existing column to match expected structure
ALTER TABLE public.user_preferences 
RENAME COLUMN email_notifications TO notifications_enabled;