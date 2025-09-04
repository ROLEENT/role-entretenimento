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
      console.log(`Buscando gêneros para perfil ${profileId} do tipo ${profileType}`);
      
      if (profileType !== 'artista') {
        return [];
      }

      try {
        // Get the source artist ID from the profile
        const { data: profile, error: profileError } = await supabase
          .from('entity_profiles')
          .select('source_id')
          .eq('id', profileId)
          .maybeSingle();

        console.log('Profile data:', profile);
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return [];
        }

        if (!profile?.source_id) {
          console.log('No source_id found for profile');
          return [];
        }

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

        console.log('Genres data:', data);
        if (error) {
          console.error('Error fetching genres:', error);
          throw error;
        }

        const genres = (data || []).map((item: any) => ({
          id: item.genres.id,
          name: item.genres.name,
          color: '#3B82F6' // Default color, can be enhanced later
        })) as Genre[];

        console.log('Mapped genres:', genres);
        return genres;
      } catch (error) {
        console.error('Error in useProfileGenres:', error);
        return [];
      }
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};