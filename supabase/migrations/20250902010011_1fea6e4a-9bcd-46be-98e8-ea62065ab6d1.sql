-- Clean up orphaned entity_profiles that don't have corresponding entries in specific tables
-- Remove profiles that claim to be 'artista' but don't exist in artists table
DELETE FROM entity_profiles 
WHERE type = 'artista' 
AND source_id NOT IN (SELECT id FROM artists);

-- Remove profiles that claim to be 'organizador' but don't exist in organizers table  
DELETE FROM entity_profiles 
WHERE type = 'organizador' 
AND source_id NOT IN (SELECT id FROM organizers);

-- Remove profiles that claim to be 'local' but don't exist in venues table
DELETE FROM entity_profiles 
WHERE type = 'local' 
AND source_id NOT IN (SELECT id FROM venues);