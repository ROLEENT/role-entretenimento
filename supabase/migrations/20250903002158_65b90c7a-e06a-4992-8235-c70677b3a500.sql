-- Add missing fields to venues table
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Update RLS policies to allow admin access to new fields
-- (RLS policies should already cover these new fields through existing policies)