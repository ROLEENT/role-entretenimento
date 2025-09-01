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

export function useProfileEvents(profileUserId: string, profileType: string) {
  return useQuery({
    queryKey: ['profile-events', profileUserId, profileType],
    queryFn: async () => {
      let query = supabase
        .from('agenda_itens')
        .select(`
          id, title, slug, subtitle, cover_url, starts_at, end_at,
          city, location_name, status, type, tags
        `)
        .eq('status', 'published')
        .not('deleted_at', 'is', null);

      // Filtrar eventos baseado no tipo de perfil
      if (profileType === 'artista') {
        // Para artistas, buscar eventos onde eles participam (via lineup ou artistas)
        query = query.contains('artists_names', [profileUserId]);
      } else if (profileType === 'local') {
        // Para locais, buscar eventos que acontecem neste local
        query = query.eq('venue_id', profileUserId);
      } else if (profileType === 'organizador') {
        // Para organizadores, buscar eventos que eles organizam
        query = query.eq('organizer_id', profileUserId);
      }

      const { data, error } = await query
        .order('starts_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as ProfileEvent[];
    },
    enabled: !!profileUserId && !!profileType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}