import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SimilarProfile = {
  id: string;
  name: string;
  handle: string;
  avatar_url?: string;
  city?: string;
  type: string;
  tags?: string[];
};

export function useProfileSimilar(profileId: string, profileTags: string[] = [], profileType: string = 'artista') {
  return useQuery({
    queryKey: ['profile-similar', profileId, profileTags, profileType],
    queryFn: async () => {
      if (!profileId || profileTags.length === 0) {
        return [];
      }

      // Buscar perfis similares baseado em tags comuns
      const { data, error } = await supabase
        .from('entity_profiles')
        .select(`
          id, name, handle, avatar_url, city, type, tags
        `)
        .eq('type', profileType)
        .neq('id', profileId)
        .overlaps('tags', profileTags)
        .limit(6);
      
      if (error) {
        console.error('Error fetching similar profiles:', error);
        return [];
      }
      
      return (data || []) as SimilarProfile[];
    },
    enabled: !!profileId && profileTags.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}