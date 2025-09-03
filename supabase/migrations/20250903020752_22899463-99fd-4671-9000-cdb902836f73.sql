-- Fix profiles_with_stats view to include followers_count field

DROP VIEW IF EXISTS profiles_with_stats;

CREATE VIEW profiles_with_stats AS
SELECT 
  ep.*,
  0 as view_count,
  0 as favorite_count,
  0 as followers_count
FROM entity_profiles ep
WHERE ep.visibility IN ('public', 'published');