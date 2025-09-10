import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SearchFilters = {
  query?: string;
  type?: 'artista' | 'local' | 'organizador';
  city?: string;
  limit?: number;
};

export type SearchResult = {
  id: string;
  name: string;
  handle: string;
  type: 'artista' | 'local' | 'organizador';
  city: string;
  avatar_url?: string;
  bio_short?: string;
  category_name?: string;
};

export function useProfileSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ['profile-search', filters],
    queryFn: async () => {
      let query = supabase
        .from('entity_profiles')
        .select(`
          id, name, handle, type, city, avatar_url, 
          bio_short, category_name
        `)
        .eq('visibility', 'public')
        .order('name', { ascending: true });

      // Apply filters
      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,bio_short.ilike.%${filters.query}%`);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []) as SearchResult[];
    },
    enabled: !!(filters.query || filters.type || filters.city),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProfileRecommendations(profileId?: string, userCity?: string) {
  return useQuery({
    queryKey: ['profile-recommendations', profileId, userCity],
    queryFn: async () => {
      let query = supabase
        .from('entity_profiles')
        .select(`
          id, name, handle, type, city, avatar_url, 
          bio_short, category_name
        `)
        .eq('visibility', 'public')
        .limit(6);

      // Exclude current profile if provided
      if (profileId) {
        query = query.neq('id', profileId);
      }

      // Prioritize profiles from the same city
      if (userCity) {
        query = query.ilike('city', `%${userCity}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []) as SearchResult[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}