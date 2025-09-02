import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileEvent = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  cover_url?: string;
  starts_at?: string;
  end_at?: string;
  city?: string;
  location_name?: string;
  status: string;
  type?: string;
  tags?: string[];
};

export function useProfileEvents(profileHandle: string, profileType: string) {
  return useQuery({
    queryKey: ['profile-events', profileHandle, profileType],
    queryFn: async () => {
      let query = supabase
        .from('agenda_itens')
        .select(`
          id, title, slug, subtitle, cover_url, starts_at, end_at,
          city, location_name, status, type, tags, artists_names
        `)
        .eq('status', 'published')
        .is('deleted_at', null);

      // Filtrar eventos baseado no tipo de perfil e handle
      if (profileType === 'artista') {
        // Para artistas, buscar eventos onde eles participam
        query = query.or(`artists_names.cs.{${profileHandle}},title.ilike.%${profileHandle}%`);
      } else if (profileType === 'local') {
        // Para locais, buscar eventos que acontecem neste local
        query = query.ilike('location_name', `%${profileHandle}%`);
      } else if (profileType === 'organizador') {
        // Para organizadores, buscar eventos que eles organizam
        query = query.ilike('title', `%${profileHandle}%`);
      }

      const { data, error } = await query
        .order('starts_at', { ascending: true })
        .gte('starts_at', new Date().toISOString())
        .limit(20);
      
      if (error) {
        console.error('Error fetching profile events:', error);
        return [];
      }
      return (data || []) as ProfileEvent[];
    },
    enabled: !!profileHandle && !!profileType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}