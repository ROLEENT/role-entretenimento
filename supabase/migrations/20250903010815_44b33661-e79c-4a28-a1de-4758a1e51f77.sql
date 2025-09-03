-- Fix entity_profiles foreign key issue for venues
-- Option 1: Allow source_id to be null in entity_profiles
ALTER TABLE public.entity_profiles ALTER COLUMN source_id DROP NOT NULL;

-- Option 2: Modify the sync_artist_to_entity_profile trigger to only work for artists table
-- Drop the existing trigger
DROP TRIGGER IF EXISTS sync_artist_to_entity_profile_trigger ON public.artists;

-- Recreate the trigger only for artists table (not venues)
CREATE TRIGGER sync_artist_to_entity_profile_trigger
    AFTER INSERT OR UPDATE ON public.artists
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_artist_to_entity_profile();

-- Add unique index for venues slug if not exists
CREATE UNIQUE INDEX IF NOT EXISTS venues_slug_idx ON public.venues(slug);

-- Update venues table to ensure gallery field exists and is jsonb
DO $$ 
BEGIN
    -- Check if gallery column exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'gallery'
    ) THEN
        ALTER TABLE public.venues ADD COLUMN gallery jsonb;
    END IF;
END $$;