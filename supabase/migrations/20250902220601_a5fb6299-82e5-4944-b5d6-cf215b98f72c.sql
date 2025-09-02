-- Create foreign key between entity_profiles.source_id and artists.id
ALTER TABLE public.entity_profiles 
ADD CONSTRAINT entity_profiles_source_id_fkey 
FOREIGN KEY (source_id) 
REFERENCES public.artists(id) 
ON DELETE SET NULL;