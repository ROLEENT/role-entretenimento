import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { createHybridEventFetcher } from '@/lib/eventDataAdapters';
import { supabase } from '@/integrations/supabase/client';
import { getCityQueryValue, isCapitalSlug } from '@/lib/cityToSlug';
import { getCleanTimestamp } from '@/utils/timestampUtils';

export interface AgendaCidadeItem {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  city?: string;
  date_start?: string;
  date_end?: string;
  image_url?: string;
  alt_text?: string;
  highlight_type?: 'curatorial' | 'vitrine' | 'none';
  status?: string;
  created_at?: string;
  ticket_url?: string;
  slug?: string;
  genres?: string[];
}

interface UseAgendaCidadeDataParams {
  city: string;
  search?: string;
  period?: string;
  genres?: string[];
  page?: number;
}

const getDateRange = (period: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'hoje':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { start: today, end: tomorrow };
      
    case 'fim-de-semana': {
      const dayOfWeek = now.getDay();
      let friday = new Date(today);
      if (dayOfWeek === 0) { // Sunday
        friday.setDate(today.getDate() + 5);
      } else if (dayOfWeek === 6) { // Saturday
        friday.setDate(today.getDate() - 1);
      } else if (dayOfWeek < 5) { // Monday to Thursday
        friday.setDate(today.getDate() + (5 - dayOfWeek));
      }
      const monday = new Date(friday);
      monday.setDate(friday.getDate() + 3);
      return { start: friday, end: monday };
    }
      
    case 'proximos-7-dias': {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return { start: today, end: nextWeek };
    }
      
    case 'este-mes': {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: today, end: endOfMonth };
    }
      
    default:
      const thirtyDays = new Date(today);
      thirtyDays.setDate(today.getDate() + 30);
      return { start: today, end: thirtyDays };
  }
};

const fetchAgendaItems = async (params: UseAgendaCidadeDataParams) => {
  if (!params.city) {
    throw new Error('Cidade não especificada');
  }

  console.log('🏙️ fetchAgendaItems called for city:', params.city, 'period:', params.period);

  const cityQueryValue = getCityQueryValue(params.city);
  const isCapital = isCapitalSlug(params.city);
  const { start, end } = getDateRange(params.period || 'proximos-7-dias');
  const itemsPerPage = 18;
  const offset = ((params.page || 1) - 1) * itemsPerPage;

  // First, fetch from events table (new admin-v3 data)
  let eventsQuery = supabase
    .from('events')
    .select('id, title, city, image_url, date_start, date_end, genres, slug, highlight_type, subtitle, summary', { count: 'exact' })
    .eq('status', 'published')
    .gte('date_start', getCleanTimestamp(start))
    .lte('date_start', getCleanTimestamp(end))
    .order('highlight_type', { ascending: false })
    .order('date_start', { ascending: true });

  if (isCapital) {
    eventsQuery = eventsQuery.eq('city', cityQueryValue);
  } else {
    eventsQuery = eventsQuery.ilike('city', cityQueryValue);
  }

  if (params.search && params.search.trim()) {
    eventsQuery = eventsQuery.ilike('title', `%${params.search.trim()}%`);
  }

  if (params.genres && params.genres.length > 0) {
    eventsQuery = eventsQuery.overlaps('genres', params.genres);
  }

  const { data: eventsData, error: eventsError, count: eventsCount } = await eventsQuery
    .range(offset, offset + itemsPerPage - 1);

  let allItems: AgendaCidadeItem[] = [];
  let totalCount = 0;

  if (eventsData && !eventsError) {
    // Transform events data to AgendaCidadeItem format
    allItems = eventsData.map(item => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      summary: item.summary,
      city: item.city,
      date_start: item.date_start,
      date_end: item.date_end,
      image_url: item.image_url,
      highlight_type: (item.highlight_type === 'vitrine' ? 'vitrine' : (item.highlight_type === 'curatorial' ? 'curatorial' : 'none')) as 'vitrine' | 'curatorial' | 'none',
      status: 'published' as const,
      slug: item.slug,
      genres: item.genres || []
    }));
    totalCount = eventsCount || 0;
  }

  // If we don't have enough items, fetch from agenda_itens as fallback
  if (allItems.length < itemsPerPage) {
    console.log('🔄 Not enough events from events table, fetching fallback from agenda_itens');
    
    let agendaQuery = supabase
      .from('agenda_itens')
      .select('id, title, city, cover_url, starts_at, end_at, tags, slug, visibility_type, subtitle, summary', { count: 'exact' })
      .eq('status', 'published')
      .gte('starts_at', getCleanTimestamp(start))
      .lte('starts_at', getCleanTimestamp(end))
      .order('visibility_type', { ascending: false })
      .order('starts_at', { ascending: true });

    if (isCapital) {
      agendaQuery = agendaQuery.eq('city', cityQueryValue);
    } else {
      agendaQuery = agendaQuery.ilike('city', cityQueryValue);
    }

    if (params.search && params.search.trim()) {
      agendaQuery = agendaQuery.ilike('title', `%${params.search.trim()}%`);
    }

    if (params.genres && params.genres.length > 0) {
      agendaQuery = agendaQuery.overlaps('tags', params.genres);
    }

    const remainingItems = itemsPerPage - allItems.length;
    const agendaOffset = Math.max(0, offset - (eventsCount || 0));
    
    const { data: agendaData, error: agendaError, count: agendaCount } = await agendaQuery
      .range(agendaOffset, agendaOffset + remainingItems - 1);

    if (agendaData && !agendaError) {
      // Transform agenda_itens data to AgendaCidadeItem format
      const transformedAgendaItems = agendaData.map(item => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        summary: item.summary,
        city: item.city,
        date_start: item.starts_at,
        date_end: item.end_at,
        image_url: item.cover_url,
        highlight_type: (item.visibility_type === 'vitrine' ? 'vitrine' : 'curatorial') as 'vitrine' | 'curatorial' | 'none',
        status: 'published' as const,
        slug: item.slug,
        genres: item.tags || []
      }));
      
      allItems = [...allItems, ...transformedAgendaItems];
      totalCount += agendaCount || 0;
      console.log('✅ Added', transformedAgendaItems.length, 'items from agenda_itens as fallback');
    }
  }

  if (eventsError && allItems.length === 0) {
    console.error('❌ fetchAgendaItems error:', eventsError);
    throw eventsError;
  }

  console.log('✅ fetchAgendaItems success for', params.city, '- found:', allItems.length, 'items, total:', totalCount);

  return {
    items: allItems,
    totalCount,
    totalPages: Math.ceil(totalCount / itemsPerPage),
  };
};

const fetchAvailableTags = async (params: Pick<UseAgendaCidadeDataParams, 'city' | 'period'>) => {
  if (!params.city) return [];

  const cityQueryValue = getCityQueryValue(params.city);
  const isCapital = isCapitalSlug(params.city);
  const { start, end } = getDateRange(params.period || 'proximos-7-dias');

  // Get tags from events table
  let eventsTagsQuery = supabase
    .from('events')
    .select('genres')
    .eq('status', 'published')
    .gte('date_start', getCleanTimestamp(start))
    .lte('date_start', getCleanTimestamp(end));

  if (isCapital) {
    eventsTagsQuery = eventsTagsQuery.eq('city', cityQueryValue);
  } else {
    eventsTagsQuery = eventsTagsQuery.ilike('city', cityQueryValue);
  }

  // Get tags from agenda_itens table  
  let agendaTagsQuery = supabase
    .from('agenda_itens')
    .select('tags')
    .eq('status', 'published')
    .gte('starts_at', getCleanTimestamp(start))
    .lte('starts_at', getCleanTimestamp(end));

  if (isCapital) {
    agendaTagsQuery = agendaTagsQuery.eq('city', cityQueryValue);
  } else {
    agendaTagsQuery = agendaTagsQuery.ilike('city', cityQueryValue);
  }

  const [{ data: eventsData, error: eventsError }, { data: agendaData, error: agendaError }] = await Promise.all([
    eventsTagsQuery,
    agendaTagsQuery
  ]);

  if (eventsError && agendaError) {
    console.error('❌ fetchAvailableTags error:', eventsError || agendaError);
    throw eventsError || agendaError;
  }

  const tagSet = new Set<string>();
  
  // Add tags from events table
  (eventsData || []).forEach((item) => {
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach((tag: string) => tagSet.add(tag));
    }
  });
  
  // Add tags from agenda_itens table
  (agendaData || []).forEach((item) => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });

  return Array.from(tagSet).sort();
};

export const useAgendaCidadeData = (params: UseAgendaCidadeDataParams) => {
  // Create stable query keys
  const itemsQueryKey = useMemo(() => [
    'agenda-cidade-items',
    params.city,
    params.search || '',
    params.period || 'proximos-7-dias',
    params.genres || [],
    params.page || 1,
  ], [params.city, params.search, params.period, params.genres, params.page]);

  const tagsQueryKey = useMemo(() => [
    'agenda-cidade-tags',
    params.city,
    params.period || 'proximos-7-dias',
  ], [params.city, params.period]);

  // Fetch agenda items with hybrid approach
  const {
    data: itemsData,
    isLoading,
    error,
    refetch: refetchItems,
  } = useQuery({
    queryKey: itemsQueryKey,
    queryFn: async () => {
      if (!params.city) {
        throw new Error('Cidade não especificada');
      }

      console.log('🏙️ Fetching unified city agenda data for:', params.city, 'period:', params.period);
      
      const cityQueryValue = getCityQueryValue(params.city);
      const { start, end } = getDateRange(params.period || 'proximos-7-dias');
      
      const hybridFetcher = createHybridEventFetcher(supabase);
      const events = await hybridFetcher({
        city: cityQueryValue,
        search: params.search,
        tags: params.genres,
        dateRange: { start, end },
        status: 'published'
      });

      console.log(`✅ Unified city agenda data fetched for ${params.city}:`, {
        total: events.length,
        sources: events.reduce((acc, event) => {
          acc[event.source] = (acc[event.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      // Transform and paginate
      const itemsPerPage = 18;
      const offset = ((params.page || 1) - 1) * itemsPerPage;
      const paginatedEvents = events.slice(offset, offset + itemsPerPage);
      
      const items: AgendaCidadeItem[] = paginatedEvents.map(event => ({
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        summary: event.summary,
        city: event.city,
        date_start: event.date_start,
        date_end: event.date_end,
        image_url: event.image_url,
        highlight_type: event.highlight_type as 'vitrine' | 'curatorial' | 'none',
        status: event.status,
        slug: event.slug,
        genres: event.genres || []
      }));
      
      return {
        items,
        totalCount: events.length,
        totalPages: Math.ceil(events.length / itemsPerPage),
      };
    },
    enabled: !!params.city,
    staleTime: 3 * 60 * 1000, // 3 minutes - events change more frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch available tags with caching
  const {
    data: availableTags = [],
    refetch: refetchTags,
  } = useQuery({
    queryKey: tagsQueryKey,
    queryFn: () => fetchAvailableTags({ city: params.city, period: params.period }),
    enabled: !!params.city,
    staleTime: 10 * 60 * 1000, // 10 minutes - tags change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const refetch = async () => {
    await Promise.all([refetchItems(), refetchTags()]);
  };

  return {
    items: itemsData?.items || [],
    totalCount: itemsData?.totalCount || 0,
    totalPages: itemsData?.totalPages || 0,
    availableTags,
    isLoading,
    error: error?.message || null,
    refetch,
  };
};