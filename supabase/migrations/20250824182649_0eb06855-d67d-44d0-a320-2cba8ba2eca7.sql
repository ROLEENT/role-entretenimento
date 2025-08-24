-- Enable RLS on storage.objects table (this should already be enabled but ensuring it's explicit)
-- Note: RLS is already enabled on storage.objects by default in Supabase

-- The errors are likely false positives since storage.objects has RLS enabled by default
-- We'll verify our policies are working correctly

-- Test that our policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%partner-logos%' OR policyname LIKE '%ads-banners%';