import { supabase } from '@/integrations/supabase/client';

interface ArtistOption {
  id: string;
  name: string;
  value: string;
}

export const useArtistLookup = () => {
  const searchArtists = async (query: string): Promise<ArtistOption[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('lookup', {
        method: 'POST',
        body: {
          type: 'artists',
          q: query,
          limit: 20
        }
      });

      if (error) {
        console.error('Error searching artists:', error);
        return [];
      }

      return (data?.data || []).map((item: any) => ({
        id: item.id,
        name: item.stage_name,
        value: item.id,
      }));
    } catch (error) {
      console.error('Error searching artists:', error);
      return [];
    }
  };

  return {
    searchArtists,
  };
};