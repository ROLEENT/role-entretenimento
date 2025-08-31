import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  city?: string;
  start_at?: string;
  end_at?: string;
  cover_url?: string;
  alt_text?: string;
  visibility_type?: 'vitrine' | 'curadoria';
  status?: string;
  priority?: number;
  ticket_url?: string;
  slug?: string;
}

export interface CityStats {
  city: string;
  count: number;
}

export interface AgendaStats {
  totalEvents: number;
  totalCities: number;
  isLoading: boolean;
}

interface AgendaFilters {
  search?: string;
  status?: string;
  city?: string;
  tags?: string[];
}

const fetchUpcomingEvents = async (filters?: AgendaFilters): Promise<AgendaItem[]> => {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  let query = supabase
    .from('agenda_public')
    .select('*')
    .eq('status', 'published');

  // Apply date filters based on status
  if (filters?.status === 'this_week') {
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);
    query = query.gte('start_at', today.toISOString()).lte('start_at', endOfWeek.toISOString());
  } else if (filters?.status === 'this_month') {
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    query = query.gte('start_at', today.toISOString()).lte('start_at', endOfMonth.toISOString());
  } else if (filters?.status === 'upcoming' || !filters?.status || filters?.status === 'all') {
    query = query.gte('start_at', today.toISOString()).lte('start_at', thirtyDaysFromNow.toISOString());
  }

  // Apply other filters
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`);
  }

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }

  if (filters?.tags && filters.tags.length > 0) {
    // This would need proper tags column implementation
    // query = query.overlaps('tags', filters.tags);
  }

  query = query
    .order('priority', { ascending: false })
    .order('start_at', { ascending: true })
    .limit(12);

  const { data, error } = await query;

  if (error) throw error;
  return (data as AgendaItem[]) || [];
};

const fetchCityStats = async (): Promise<{ cityStats: CityStats[]; totalEvents: number; totalCities: number }> => {
  const today = new Date();

  const { data, error } = await supabase
    .from('agenda_public')
    .select('city')
    .eq('status', 'published')
    .gte('start_at', today.toISOString());

  if (error) throw error;

  // Calculate stats
  const cityCount: Record<string, number> = {};
  (data || []).forEach((item) => {
    if (item.city) {
      cityCount[item.city] = (cityCount[item.city] || 0) + 1;
    }
  });

  const cityStats = Object.entries(cityCount).map(([city, count]) => ({
    city,
    count,
  }));

  const totalEvents = Object.values(cityCount).reduce((sum, count) => sum + count, 0);
  const totalCities = Object.keys(cityCount).length;

  return { cityStats, totalEvents, totalCities };
};

export const useAgendaData = (filters?: AgendaFilters) => {
  // Fetch upcoming events
  const {
    data: upcomingEvents = [],
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['agenda-upcoming-events', filters],
    queryFn: () => fetchUpcomingEvents(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes for stable data
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch city stats
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['agenda-city-stats'],
    queryFn: fetchCityStats,
    staleTime: 15 * 60 * 1000, // 15 minutes for stats
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const cityStats = statsData?.cityStats || [];
  const stats = {
    totalEvents: statsData?.totalEvents || 0,
    totalCities: statsData?.totalCities || 0,
    isLoading: isLoadingStats,
  };

  const error = eventsError || statsError;
  const refetch = async () => {
    await Promise.all([refetchEvents(), refetchStats()]);
  };

  return {
    upcomingEvents,
    cityStats,
    stats,
    isLoadingEvents,
    error: error?.message || null,
    refetch,
  };
};