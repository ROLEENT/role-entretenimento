import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileEvent = {
  id: string;
  title: string;
  slug: string;
  date_start: string;
  date_end?: string;
  venue_name?: string;
  venue_city?: string;
  artists?: string[];
  organizer_name?: string;
  image_url?: string;
  status: 'published' | 'draft' | 'cancelled';
  event_type: 'upcoming' | 'past';
};

export type ProfileEventsData = {
  upcoming: ProfileEvent[];
  past: ProfileEvent[];
};

export function useProfileEvents(profileId: string, profileType: 'artista' | 'local' | 'organizador') {
  return useQuery({
    queryKey: ['profile-events', profileId, profileType],
    queryFn: async (): Promise<ProfileEventsData> => {
      let query;
      const now = new Date().toISOString();

      // Different queries based on profile type
      switch (profileType) {
        case 'artista':
          // Get events where this artist is performing
          query = supabase
            .from('agenda_itens')
            .select(`
              id, title, slug, starts_at, end_at, location_name, city,
              status, cover_url, artists_names
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
              id, title, slug, starts_at, end_at, location_name, city,
              status, cover_url, artists_names
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
              id, title, slug, starts_at, end_at, location_name, city,
              status, cover_url, artists_names
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

      // Transform and categorize data
      const events = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        slug: event.slug,
        date_start: event.starts_at,
        date_end: event.end_at,
        venue_name: event.location_name,
        venue_city: event.city,
        artists: event.artists_names || [],
        image_url: event.cover_url,
        status: event.status as ProfileEvent['status'],
        event_type: (new Date(event.starts_at) >= new Date(now) ? 'upcoming' : 'past') as ProfileEvent['event_type']
      }));

      // Separate upcoming and past events
      const upcoming = events.filter(event => event.event_type === 'upcoming');
      const past = events.filter(event => event.event_type === 'past').reverse(); // Most recent first

      return { upcoming, past };
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}