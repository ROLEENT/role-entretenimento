import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileEvent = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  starts_at: string;
  end_at?: string;
  location_name?: string;
  city?: string;
  artists_names?: string[];
  cover_url?: string;
  status: 'published' | 'draft' | 'cancelled';
  tags?: string[];
  source?: 'events' | 'agenda';
  event_id?: string;
};

export function useProfileEvents(profileId: string, profileType: 'artista' | 'local' | 'organizador') {
  return useQuery({
    queryKey: ['profile-events', profileId, profileType],
    queryFn: async (): Promise<ProfileEvent[]> => {
      let query;

      // Different queries based on profile type
      switch (profileType) {
        case 'artista':
          // Get events where this artist is performing
          query = supabase
            .from('agenda_itens')
            .select(`
              id, title, slug, subtitle, starts_at, end_at, location_name, city,
              status, cover_url, artists_names, tags
            `)
            .contains('lineup_ids', [profileId])
            .eq('status', 'published')
            .order('starts_at', { ascending: true });
          break;

        case 'local':
          // Get events at this venue
          query = supabase
            .from('agenda_itens')
            .select(`
              id, title, slug, subtitle, starts_at, end_at, location_name, city,
              status, cover_url, artists_names, tags
            `)
            .eq('venue_id', profileId)
            .eq('status', 'published')
            .order('starts_at', { ascending: true });
          break;

        case 'organizador':
          // Get events organized by this organizer
          query = supabase
            .from('agenda_itens')
            .select(`
              id, title, slug, subtitle, starts_at, end_at, location_name, city,
              status, cover_url, artists_names, tags
            `)
            .contains('organizer_ids', [profileId])
            .eq('status', 'published')
            .order('starts_at', { ascending: true });
          break;

        default:
          throw new Error('Invalid profile type');
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Transform and return data
      return (data || []).map(event => ({
        id: event.id,
        title: event.title,
        slug: event.slug,
        subtitle: event.subtitle,
        starts_at: event.starts_at,
        end_at: event.end_at,
        location_name: event.location_name,
        city: event.city,
        artists_names: event.artists_names || [],
        cover_url: event.cover_url,
        status: event.status as ProfileEvent['status'],
        tags: event.tags || [],
        source: 'agenda'
      }));
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}