import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCleanTimestamp, getCleanDateRange } from '@/utils/timestampUtils';

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
    .from('events')
    .select(`
      id, 
      title, 
      subtitle, 
      city, 
      date_start, 
      date_end, 
      image_url, 
      alt_text, 
      highlight_type, 
      status, 
      priority, 
      ticket_url, 
      slug
    `)
    .eq('status', 'published');

  // Apply date filters based on status
  if (filters?.status === 'this_week') {
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);
    const { start, end } = getCleanDateRange(today, endOfWeek);
    query = query.gte('date_start', start).lte('date_start', end);
  } else if (filters?.status === 'this_month') {
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const { start, end } = getCleanDateRange(today, endOfMonth);
    query = query.gte('date_start', start).lte('date_start', end);
  } else if (filters?.status === 'upcoming' || !filters?.status || filters?.status === 'all') {
    const { start, end } = getCleanDateRange(today, thirtyDaysFromNow);
    query = query.gte('date_start', start).lte('date_start', end);
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
    .order('date_start', { ascending: true })
    .limit(12);

  const { data, error } = await query;

  if (error) throw error;
  
  // Transform data to match AgendaItem interface
  const transformedData = (data || []).map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    city: item.city,
    start_at: item.date_start,
    end_at: item.date_end,
    cover_url: item.image_url,
    alt_text: item.alt_text,
    visibility_type: (item.highlight_type === 'showcase' ? 'vitrine' : 'curadoria') as 'vitrine' | 'curadoria',
    status: item.status,
    priority: item.priority,
    ticket_url: item.ticket_url,
    slug: item.slug,
  }));

  return transformedData;
};

const fetchCityStats = async (): Promise<{ cityStats: CityStats[]; totalEvents: number; totalCities: number }> => {
  const today = new Date();

  const { data, error } = await supabase
    .from('events')
    .select('city')
    .eq('status', 'published')
    .gte('date_start', getCleanTimestamp(today));

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