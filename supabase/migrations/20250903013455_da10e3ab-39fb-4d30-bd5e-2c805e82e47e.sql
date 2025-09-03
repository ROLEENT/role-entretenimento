-- Remove the problematic foreign key constraint that prevents venues from creating entity_profiles
ALTER TABLE public.entity_profiles DROP CONSTRAINT IF EXISTS entity_profiles_source_id_fkey;

-- Create performance index on source_id (without FK constraint)
CREATE INDEX IF NOT EXISTS idx_entity_profiles_source_id ON public.entity_profiles(source_id);

-- Verify the trigger for venues exists and works correctly
-- The sync_venue_trigger should now work without FK violations