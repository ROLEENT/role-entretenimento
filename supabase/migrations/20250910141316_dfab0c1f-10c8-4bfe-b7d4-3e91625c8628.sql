-- Add deleted_at column to artists table
ALTER TABLE public.artists ADD COLUMN deleted_at timestamp with time zone;

-- Update RLS policies for artists table
DROP POLICY IF EXISTS "Public can view active artists" ON public.artists;
DROP POLICY IF EXISTS "Authenticated users can view active artists" ON public.artists;

-- Create new RLS policy to exclude soft-deleted artists
CREATE POLICY "Public can view active artists" 
ON public.artists 
FOR SELECT 
USING (status = 'active'::text AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can view active artists" 
ON public.artists 
FOR SELECT 
USING (status = 'active'::text AND deleted_at IS NULL);

-- Update admin policies to include soft-deleted check
DROP POLICY IF EXISTS "Admins can manage artists" ON public.artists;

CREATE POLICY "Admins can manage artists" 
ON public.artists 
FOR ALL 
USING (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.email = ((current_setting('request.headers'::text, true))::json ->> 'x-admin-email'::text)) AND (admin_users.is_active = true))))
WITH CHECK (EXISTS ( SELECT 1
   FROM admin_users
  WHERE ((admin_users.email = ((current_setting('request.headers'::text, true))::json ->> 'x-admin-email'::text)) AND (admin_users.is_active = true))));

-- Create index for better performance on deleted_at queries
CREATE INDEX idx_artists_deleted_at ON public.artists(deleted_at) WHERE deleted_at IS NULL;