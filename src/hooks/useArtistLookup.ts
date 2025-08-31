import { supabase } from '@/integrations/supabase/client';

interface ArtistOption {
  id: string;
  name: string;
  value: string;
}

export const useArtistLookup = () => {
  const searchArtists = async (query: string): Promise<ArtistOption[]> => {
    try {
      const queryParams = query ? `?q=${encodeURIComponent(query)}` : '';
      const { data, error } = await supabase.functions.invoke(`lookup/artists${queryParams}`, {
        method: 'GET',
      });

      if (error) {
        console.error('Error searching artists:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
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