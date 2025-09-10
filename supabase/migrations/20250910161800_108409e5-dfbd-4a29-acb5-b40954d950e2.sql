-- Fix RLS policies for artists table to allow proper admin deletion

-- First, check if we have a function to validate admin users
CREATE OR REPLACE FUNCTION public.check_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND is_admin = true
  );
$$;

-- Update artists table RLS policies for deletion
DROP POLICY IF EXISTS "artists_delete_admin" ON public.artists;

CREATE POLICY "Admins can delete artists" 
ON public.artists 
FOR DELETE 
USING (public.check_user_is_admin());

-- Ensure UPDATE policy exists for soft delete
DROP POLICY IF EXISTS "Admins can update all artists" ON public.artists;

CREATE POLICY "Admins can update all artists" 
ON public.artists 
FOR UPDATE 
USING (public.check_user_is_admin())
WITH CHECK (public.check_user_is_admin());

-- Add foreign key constraints with CASCADE for related tables if they exist
-- This prevents FK constraint violations during deletion

-- For artist_genres table
ALTER TABLE public.artist_genres 
DROP CONSTRAINT IF EXISTS artist_genres_artist_id_fkey;

ALTER TABLE public.artist_genres 
ADD CONSTRAINT artist_genres_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;

-- For artists_categories table  
ALTER TABLE public.artists_categories 
DROP CONSTRAINT IF EXISTS artists_categories_artist_id_fkey;

ALTER TABLE public.artists_categories 
ADD CONSTRAINT artists_categories_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;

-- For artists_genres table (if it exists with different name)
ALTER TABLE public.artists_genres 
DROP CONSTRAINT IF EXISTS artists_genres_artist_id_fkey;

ALTER TABLE public.artists_genres 
ADD CONSTRAINT artists_genres_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;