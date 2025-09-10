import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRealProfileStats(profileId: string, type: string) {
  return useQuery({
    queryKey: ["real-profile-stats", profileId, type],
    queryFn: async () => {
      const stats = {
        eventCount: 0,
        mediaCount: 0,
        followersCount: 0,
        contentCount: 0
      };

      if (!profileId) return stats;

      try {
        // Count real followers from follows table
        const { count: followersCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', type)
          .eq('entity_uuid', profileId);

        stats.followersCount = followersCount || 0;

        // Count events based on profile type
        if (type === 'artist') {
          const { count: artistEvents } = await supabase
            .from('agenda_item_artists')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', profileId);
          stats.eventCount = artistEvents || 0;
        } else if (type === 'organizer') {
          const { count: organizerEvents } = await supabase
            .from('agenda_item_organizers')
            .select('*', { count: 'exact', head: true })
            .eq('organizer_id', profileId);
          stats.eventCount = organizerEvents || 0;
        }

        // Count media from agenda_media for related events
        let mediaQuery = supabase
          .from('agenda_media')
          .select('*', { count: 'exact', head: true });

        if (type === 'artist') {
          // Get media from events where this artist performed
          const { data: artistAgendas } = await supabase
            .from('agenda_item_artists')
            .select('agenda_id')
            .eq('artist_id', profileId);
          
          if (artistAgendas && artistAgendas.length > 0) {
            const agendaIds = artistAgendas.map(a => a.agenda_id);
            const { count: mediaCount } = await supabase
              .from('agenda_media')
              .select('*', { count: 'exact', head: true })
              .in('agenda_id', agendaIds);
            stats.mediaCount = mediaCount || 0;
          }
        } else if (type === 'organizer') {
          // Get media from events organized by this organizer
          const { data: organizerAgendas } = await supabase
            .from('agenda_item_organizers')
            .select('agenda_id')
            .eq('organizer_id', profileId);
          
          if (organizerAgendas && organizerAgendas.length > 0) {
            const agendaIds = organizerAgendas.map(a => a.agenda_id);
            const { count: mediaCount } = await supabase
              .from('agenda_media')
              .select('*', { count: 'exact', head: true })
              .in('agenda_id', agendaIds);
            stats.mediaCount = mediaCount || 0;
          }
        }

        // For content count, we can count agenda items as content
        stats.contentCount = stats.eventCount;

        return stats;
      } catch (error) {
        console.error('Error fetching real profile stats:', error);
        return stats;
      }
    },
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}