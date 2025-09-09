-- Add music_genres and acting_genres columns to artists table
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS music_genres text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS acting_genres text[] DEFAULT '{}';