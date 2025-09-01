-- Create profiles_with_stats view for profile listings with follower counts
CREATE VIEW public.profiles_with_stats AS
SELECT 
  ep.*,
  COALESCE(follower_counts.followers_count, 0) as followers_count
FROM public.entity_profiles ep
LEFT JOIN (
  SELECT 
    profile_id,
    COUNT(*) as followers_count
  FROM public.followers 
  GROUP BY profile_id
) follower_counts ON ep.id = follower_counts.profile_id
WHERE ep.visibility = 'public';