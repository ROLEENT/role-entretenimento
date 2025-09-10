import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useArtistCategory = (categoryId?: string) => {
  return useQuery({
    queryKey: ['artist-category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from('artist_categories')
        .select('id, name, slug')
        .eq('id', categoryId)
        .single();

      if (error) {
        console.error('Error fetching artist category:', error);
        return null;
      }

      return data;
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};