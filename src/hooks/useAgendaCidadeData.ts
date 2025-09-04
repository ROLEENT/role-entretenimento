import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCityQueryValue, isCapitalSlug } from '@/lib/cityToSlug';
import { getCleanTimestamp, getCleanDateRange } from '@/utils/timestampUtils';

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
  highlight_type?: 'curatorial' | 'showcase' | 'none';
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
  tags?: string[];
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

  const cityQueryValue = getCityQueryValue(params.city);
  const isCapital = isCapitalSlug(params.city);
  const { start, end } = getDateRange(params.period || 'proximos-7-dias');
  const itemsPerPage = 18;
  const offset = ((params.page || 1) - 1) * itemsPerPage;

  let query = supabase
    .from('events')
    .select('id, title, city, image_url, date_start, date_end, genres, slug, highlight_type, subtitle, summary', { count: 'exact' })
    .eq('status', 'published')
    .gte('date_start', getCleanTimestamp(start))
    .lte('date_start', getCleanTimestamp(end))
    .order('highlight_type', { ascending: false })
    .order('date_start', { ascending: true })
    .range(offset, offset + itemsPerPage - 1);

  if (isCapital) {
    query = query.eq('city', cityQueryValue);
  } else {
    query = query.ilike('city', cityQueryValue);
  }

  if (params.search && params.search.trim()) {
    query = query.ilike('title', `%${params.search.trim()}%`);
  }

  if (params.tags && params.tags.length > 0) {
    query = query.overlaps('genres', params.tags);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    items: (data as AgendaCidadeItem[]) || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / itemsPerPage),
  };
};

const fetchAvailableTags = async (params: Pick<UseAgendaCidadeDataParams, 'city' | 'period'>) => {
  if (!params.city) return [];

  const cityQueryValue = getCityQueryValue(params.city);
  const isCapital = isCapitalSlug(params.city);
  const { start, end } = getDateRange(params.period || 'proximos-7-dias');

  let tagsQuery = supabase
    .from('events')
    .select('genres')
    .eq('status', 'published')
    .gte('date_start', getCleanTimestamp(start))
    .lte('date_start', getCleanTimestamp(end));

  if (isCapital) {
    tagsQuery = tagsQuery.eq('city', cityQueryValue);
  } else {
    tagsQuery = tagsQuery.ilike('city', cityQueryValue);
  }

  const { data, error } = await tagsQuery;
  if (error) throw error;

  const tagSet = new Set<string>();
  (data || []).forEach((item) => {
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach((tag: string) => tagSet.add(tag));
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
    params.tags || [],
    params.page || 1,
  ], [params.city, params.search, params.period, params.tags, params.page]);

  const tagsQueryKey = useMemo(() => [
    'agenda-cidade-tags',
    params.city,
    params.period || 'proximos-7-dias',
  ], [params.city, params.period]);

  // Fetch agenda items with caching
  const {
    data: itemsData,
    isLoading,
    error,
    refetch: refetchItems,
  } = useQuery({
    queryKey: itemsQueryKey,
    queryFn: () => fetchAgendaItems(params),
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