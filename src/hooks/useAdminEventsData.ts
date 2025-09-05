import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from 'react';
import { useEventCompletionStatus } from './useCompletionStatus';

interface EventFilters {
  search?: string;
  status?: string;
  city?: string;
  dateStart?: string;
  dateEnd?: string;
  organizer?: string;
  venue?: string;
  completion?: string;
  showDeleted?: boolean;
}

export const useAdminEventsData = (filters: EventFilters = {}) => {
  // Fetch events
  const {
    data: events = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-events", filters],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          venue:venues(id, name, address, city),
          organizer:organizers(id, name)
        `);

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      if (filters.dateStart) {
        query = query.gte("date_start", filters.dateStart);
      }

      if (filters.dateEnd) {
        query = query.lte("date_start", filters.dateEnd);
      }

      if (filters.organizer) {
        query = query.eq("organizer_id", filters.organizer);
      }

      if (filters.venue) {
        query = query.eq("venue_id", filters.venue);
      }

      // Filter by deleted status
      if (filters.showDeleted) {
        query = query.not("deleted_at", "is", null);
      } else {
        query = query.is("deleted_at", null);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });

  // Apply completion filter client-side
  const filteredEvents = useMemo(() => {
    if (!events || !filters.completion || filters.completion === 'all') {
      return events;
    }

    return events.filter(event => {
      const { status: completionStatus } = useEventCompletionStatus(event);
      return completionStatus === filters.completion;
    });
  }, [events, filters.completion]);

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin-events-stats"],
    queryFn: async () => {
      const { data: allEvents, error } = await supabase
        .from("events")
        .select("status, created_at, deleted_at");

      if (error) throw error;

      const activeEvents = allEvents?.filter(e => !e.deleted_at) || [];
      const trashedEvents = allEvents?.filter(e => e.deleted_at) || [];
      
      const total = activeEvents.length;
      const published = activeEvents.filter(e => e.status === "published").length;
      const draft = activeEvents.filter(e => e.status === "draft").length;
      const trashed = trashedEvents.length;
      
      const thisMonth = activeEvents.filter(e => {
        const eventDate = new Date(e.created_at);
        const now = new Date();
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }).length;

      return {
        total,
        published,
        draft,
        thisMonth,
        trashed,
      };
    },
  });

  return {
    events: filteredEvents,
    loading,
    error,
    refetch,
    stats,
  };
};