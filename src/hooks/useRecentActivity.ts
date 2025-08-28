import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentItem {
  id: string;
  title: string;
  type: 'highlight' | 'event' | 'venue' | 'organizer';
  updatedAt: string;
  status?: string;
  city?: string;
}

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<RecentItem[]> => {
      const [highlightsResult, eventsResult, venuesResult, organizersResult] = await Promise.all([
        supabase
          .from('highlights')
          .select('id, event_title, updated_at, status, city')
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from('events')
          .select('id, title, updated_at, status, city')
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from('venues')
          .select('id, name, updated_at')
          .order('updated_at', { ascending: false })
          .limit(2),
        supabase
          .from('organizers')
          .select('id, name, updated_at')
          .order('updated_at', { ascending: false })
          .limit(2)
      ]);

      const highlights = (highlightsResult.data || []).map(h => ({
        id: h.id,
        title: h.event_title,
        type: 'highlight' as const,
        updatedAt: h.updated_at,
        status: h.status,
        city: h.city,
      }));

      const events = (eventsResult.data || []).map(e => ({
        id: e.id,
        title: e.title,
        type: 'event' as const,
        updatedAt: e.updated_at,
        status: e.status,
        city: e.city,
      }));

      const venues = (venuesResult.data || []).map(v => ({
        id: v.id,
        title: v.name,
        type: 'venue' as const,
        updatedAt: v.updated_at,
      }));

      const organizers = (organizersResult.data || []).map(o => ({
        id: o.id,
        title: o.name,
        type: 'organizer' as const,
        updatedAt: o.updated_at,
      }));

      return [...highlights, ...events, ...venues, ...organizers]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
    },
    staleTime: 30000, // 30 segundos
  });
};