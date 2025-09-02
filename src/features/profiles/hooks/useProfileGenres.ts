import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Genre {
  id: string;
  name: string;
  color?: string;
}

export const useProfileGenres = (profileId: string, profileType: 'artista' | 'local' | 'organizador') => {
  return useQuery({
    queryKey: ['profile-genres', profileId, profileType],
    queryFn: async () => {
      if (profileType !== 'artista') {
        return [];
      }

      // Get the source artist ID from the profile
      const { data: profile } = await supabase
        .from('entity_profiles')
        .select('source_id')
        .eq('id', profileId)
        .single();

      if (!profile?.source_id) return [];

      // Get genres for the artist
      const { data, error } = await supabase
        .from('artists_genres')
        .select(`
          genre_id,
          genres!inner(
            id,
            name
          )
        `)
        .eq('artist_id', profile.source_id);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.genres.id,
        name: item.genres.name,
        color: '#3B82F6' // Default color, can be enhanced later
      })) as Genre[];
    },
    enabled: !!profileId,
  });
};