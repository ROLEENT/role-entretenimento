-- Criar view para unir entity_profiles com contagem de seguidores para melhor performance
CREATE OR REPLACE VIEW public.profiles_with_stats AS
SELECT 
  p.*,
  COALESCE(follower_stats.followers_count, 0) as followers_count
FROM public.entity_profiles p
LEFT JOIN (
  SELECT 
    profile_id,
    COUNT(*) as followers_count
  FROM public.followers
  GROUP BY profile_id
) follower_stats ON follower_stats.profile_id = p.id
WHERE p.visibility = 'public';

-- Garantir que RLS funciona na view
ALTER VIEW public.profiles_with_stats OWNER TO postgres;

-- Política para a view (herdará da tabela entity_profiles)
GRANT SELECT ON public.profiles_with_stats TO authenticated;
GRANT SELECT ON public.profiles_with_stats TO anon;