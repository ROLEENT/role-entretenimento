import { useQuery } from '@tanstack/react-query';
import { createHybridEventFetcher } from '@/lib/eventDataAdapters';
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
  console.log('🔍 fetchUpcomingEvents called with filters:', filters);
  
  // Use CURRENT_DATE to include events from today (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start from beginning of today
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  thirtyDaysFromNow.setHours(23, 59, 59, 999); // End of day

  // First, try to get events from the 'events' table (new admin-v3 data)
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
      cover_alt, 
      highlight_type, 
      status, 
      ticket_url, 
      slug,
      genres
    `)
    .eq('status', 'published');

  // Apply date filters based on status - use date comparison to include current day events
  if (filters?.status === 'this_week') {
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);
    query = query.gte('date_start', today.toISOString()).lte('date_start', endOfWeek.toISOString());
  } else if (filters?.status === 'this_month') {
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    query = query.gte('date_start', today.toISOString()).lte('date_start', endOfMonth.toISOString());
  } else if (filters?.status === 'upcoming' || !filters?.status || filters?.status === 'all') {
    // Include current day events by using date comparison
    query = query.gte('date_start', today.toISOString()).lte('date_start', thirtyDaysFromNow.toISOString());
  }

  // Apply other filters
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`);
  }

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('genres', filters.tags);
  }

  query = query
    .order('date_start', { ascending: true })
    .limit(12);

  const { data: eventsData, error: eventsError } = await query;
  
  let allEvents: any[] = eventsData || [];
  
  // If we don't have enough events from the 'events' table, fetch from 'agenda_itens' as fallback
  if (allEvents.length < 12) {
    console.log('🔄 Not enough events from events table, fetching fallback from agenda_itens');
    
    let agendaQuery = supabase
      .from('agenda_itens')
      .select(`
        id, 
        title, 
        subtitle, 
        city, 
        starts_at, 
        end_at, 
        cover_url, 
        alt_text, 
        visibility_type, 
        status, 
        ticket_url, 
        slug,
        tags
      `)
      .eq('status', 'published');

    // Apply same filters to agenda_itens
    if (filters?.status === 'this_week') {
      const endOfWeek = new Date();
      endOfWeek.setDate(today.getDate() + 7);
      endOfWeek.setHours(23, 59, 59, 999);
      agendaQuery = agendaQuery.gte('starts_at', today.toISOString()).lte('starts_at', endOfWeek.toISOString());
    } else if (filters?.status === 'this_month') {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      agendaQuery = agendaQuery.gte('starts_at', today.toISOString()).lte('starts_at', endOfMonth.toISOString());
    } else if (filters?.status === 'upcoming' || !filters?.status || filters?.status === 'all') {
      agendaQuery = agendaQuery.gte('starts_at', today.toISOString()).lte('starts_at', thirtyDaysFromNow.toISOString());
    }

    if (filters?.search) {
      agendaQuery = agendaQuery.or(`title.ilike.%${filters.search}%,subtitle.ilike.%${filters.search}%`);
    }

    if (filters?.city) {
      agendaQuery = agendaQuery.eq('city', filters.city);
    }

    if (filters?.tags && filters.tags.length > 0) {
      agendaQuery = agendaQuery.overlaps('tags', filters.tags);
    }

    agendaQuery = agendaQuery
      .order('starts_at', { ascending: true })
      .limit(12 - allEvents.length);

    const { data: agendaData, error: agendaError } = await agendaQuery;
    
    if (agendaData && !agendaError) {
      // Transform agenda_itens data to match events format
      const transformedAgendaData = agendaData.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        city: item.city,
        date_start: item.starts_at,
        date_end: item.end_at,
        image_url: item.cover_url,
        cover_alt: item.alt_text,
        highlight_type: item.visibility_type === 'vitrine' ? 'vitrine' : 'curatorial',
        status: item.status,
        ticket_url: item.ticket_url,
        slug: item.slug,
        genres: item.tags || []
      }));
      
      allEvents = [...allEvents, ...transformedAgendaData];
      console.log('✅ Added', transformedAgendaData.length, 'events from agenda_itens as fallback');
    }
  }

  if (eventsError && allEvents.length === 0) {
    console.error('❌ fetchUpcomingEvents error:', eventsError);
    throw eventsError;
  }
  
  console.log('✅ fetchUpcomingEvents success, found:', allEvents.length, 'total events');
  
  // Transform data to match AgendaItem interface
  const transformedData = allEvents.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    city: item.city,
    start_at: item.date_start || item.starts_at,
    end_at: item.date_end || item.end_at,
    cover_url: item.image_url || item.cover_url,
    alt_text: item.cover_alt || item.alt_text,
    visibility_type: (item.highlight_type === 'vitrine' ? 'vitrine' : 'curadoria') as 'vitrine' | 'curadoria',
    status: item.status,
    ticket_url: item.ticket_url,
    slug: item.slug,
  }));

  return transformedData;
};

const fetchCityStats = async (): Promise<{ cityStats: CityStats[]; totalEvents: number; totalCities: number }> => {
  console.log('📊 fetchCityStats called');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start from beginning of today

  // Get stats from events table first
  const { data: eventsData, error: eventsError } = await supabase
    .from('events')
    .select('city')
    .eq('status', 'published')
    .gte('date_start', today.toISOString());

  // Get stats from agenda_itens as fallback/supplement
  const { data: agendaData, error: agendaError } = await supabase
    .from('agenda_itens')
    .select('city')
    .eq('status', 'published')
    .gte('starts_at', today.toISOString());

  if (eventsError && agendaError) {
    console.error('❌ fetchCityStats error:', eventsError || agendaError);
    throw eventsError || agendaError;
  }

  console.log('✅ fetchCityStats success - events:', eventsData?.length || 0, 'agenda:', agendaData?.length || 0);

  // Combine and calculate stats from both sources
  const cityCount: Record<string, number> = {};
  
  // Count from events table
  (eventsData || []).forEach((item) => {
    if (item.city) {
      cityCount[item.city] = (cityCount[item.city] || 0) + 1;
    }
  });
  
  // Count from agenda_itens table
  (agendaData || []).forEach((item) => {
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

  console.log('📊 Combined city stats:', { totalEvents, totalCities, cityStats });

  return { cityStats, totalEvents, totalCities };
};

export const useAgendaData = (filters?: AgendaFilters) => {
  // Fetch upcoming events using hybrid approach
  const {
    data: upcomingEvents = [],
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['agenda-upcoming-events', filters],
    queryFn: async () => {
      console.log("🔍 Fetching unified agenda data with filters:", filters);
      
      const hybridFetcher = createHybridEventFetcher(supabase);
      const events = await hybridFetcher({
        city: filters?.city,
        search: filters?.search,
        tags: filters?.tags,
        dateRange: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        status: 'published'
      });

      console.log("✅ Unified agenda data fetched successfully:", {
        total: events.length,
        sources: events.reduce((acc, event) => {
          acc[event.source] = (acc[event.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      // Transform to match the expected AgendaItem interface
      return events.map(event => ({
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        city: event.city,
        start_at: event.date_start,
        end_at: event.date_end,
        cover_url: event.image_url,
        alt_text: event.image_url, // Use image_url as fallback
        visibility_type: (event.highlight_type === 'vitrine' ? 'vitrine' : 'curadoria') as 'vitrine' | 'curadoria',
        status: event.status,
        ticket_url: event.ticket_url,
        slug: event.slug,
      }));
    },
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