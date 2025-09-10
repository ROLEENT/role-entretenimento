import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfileStats(handle: string, type: string, userId?: string) {
  const query = useQuery({
    queryKey: ["profile-stats", handle, type, userId],
    queryFn: async () => {
      const stats = {
        eventCount: 0,
        mediaCount: 0,
        followersCount: 0,
        followingCount: 0
      };

      if (!handle) return stats;

      try {
        // Count events based on profile type
        if (type === 'artista') {
          const { count: artistEvents } = await supabase
            .from('agenda_item_artists')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', userId);
          stats.eventCount = artistEvents || 0;
        } else if (type === 'organizador') {
          const { count: organizerEvents } = await supabase
            .from('agenda_item_organizers')
            .select('*', { count: 'exact', head: true })
            .eq('organizer_id', userId);
          stats.eventCount = organizerEvents || 0;
        }

        // Count media (placeholder for now)
        stats.mediaCount = Math.floor(Math.random() * 20);

        // Count followers (placeholder for now)
        stats.followersCount = Math.floor(Math.random() * 1000);
        stats.followingCount = Math.floor(Math.random() * 500);

        return stats;
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        return stats;
      }
    },
    enabled: !!handle,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...query,
    eventCount: query.data?.eventCount || 0,
    mediaCount: query.data?.mediaCount || 0,
    followersCount: query.data?.followersCount || 0,
    followingCount: query.data?.followingCount || 0
  };
}