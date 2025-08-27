-- Remove all conflicting storage policies for venues and organizers buckets
-- This will clean up any duplicate or conflicting policies

-- Drop old policies for venues bucket if they exist
DROP POLICY IF EXISTS "Admin users can manage venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can view venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update venue files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete venue files" ON storage.objects;
DROP POLICY IF EXISTS "Venue files admin access" ON storage.objects;

-- Drop old policies for organizers bucket if they exist  
DROP POLICY IF EXISTS "Admin users can manage organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can view organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete organizer files" ON storage.objects;
DROP POLICY IF EXISTS "Organizer files admin access" ON storage.objects;

-- Ensure we have the venues bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('venues', 'venues', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure we have the organizers bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organizers', 'organizers', true)
ON CONFLICT (id) DO NOTHING;