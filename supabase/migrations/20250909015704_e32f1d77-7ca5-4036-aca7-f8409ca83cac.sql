-- Remove orphan profile resp3x that has no corresponding artist in admin
DELETE FROM entity_profiles 
WHERE handle = 'resp3x' AND source_id IS NULL;