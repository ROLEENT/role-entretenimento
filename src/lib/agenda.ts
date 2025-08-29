import { supabase } from '@/integrations/supabase/client';

// Types
export interface AgendaItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  subtitle?: string;
  cover_url?: string;
  alt_text?: string;
  city?: string;
  start_at?: string;
  end_at?: string;
  ticket_url?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  noindex?: boolean;
  patrocinado?: boolean;
  priority?: number;
  venue_id?: string;
  organizer_id?: string;
  created_at: string;
  updated_at: string;
  status: string;
  visibility_type: string;
  venue?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
  };
  organizer?: {
    id: string;
    name: string;
    site?: string;
    instagram?: string;
  };
}

export interface FetchAgendaParams {
  city?: string;
  from?: string; // ISO date string
  to?: string; // ISO date string
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface FetchAgendaResult {
  items: AgendaItem[];
  total: number;
  hasMore: boolean;
}

export interface CityCounts {
  city: string;
  count: number;
}

export interface AgendaCounts {
  cities: CityCounts[];
  total: number;
}

export interface NavigationItem {
  id: string;
  slug: string;
  title: string;
  start_at?: string;
}

export interface NavigationResult {
  previous: NavigationItem | null;
  next: NavigationItem | null;
}

// Error mapping
export class AgendaError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AgendaError';
  }
}

const mapError = (error: any): AgendaError => {
  if (error.code === 'PGRST116') {
    return new AgendaError('Item não encontrado', 'NOT_FOUND');
  }
  if (error.code === 'PGRST301') {
    return new AgendaError('Múltiplos resultados encontrados', 'MULTIPLE_RESULTS');
  }
  if (error.message?.includes('connection')) {
    return new AgendaError('Erro de conexão', 'CONNECTION_ERROR');
  }
  return new AgendaError('Erro interno do servidor', 'SERVER_ERROR');
};

// Date utilities
const parseUTCDate = (dateString?: string): Date | null => {
  if (!dateString) return null;
  try {
    // Ensure we parse as UTC to avoid timezone issues
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const formatDateForQuery = (date: string): string => {
  // Convert to ISO string to ensure consistent UTC handling
  return new Date(date).toISOString();
};

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

const getCacheKey = (fn: string, params: any): string => {
  return `${fn}:${JSON.stringify(params)}`;
};

const getFromCache = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCache = (key: string, data: any): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Main functions

/**
 * Fetch agenda items with optional filters
 */
export const fetchAgenda = async (params: FetchAgendaParams = {}): Promise<FetchAgendaResult> => {
  const {
    city,
    from,
    to,
    search,
    tags = [],
    limit = 18,
    offset = 0
  } = params;

  const cacheKey = getCacheKey('fetchAgenda', params);
  const cached = getFromCache<FetchAgendaResult>(cacheKey);
  if (cached) return cached;

  try {
    let query = supabase
      .from('agenda_public')
      .select(`
        *,
        venue:venues(id, name, address, city),
        organizer:organizers(id, name, site, instagram)
      `, { count: 'exact' })
      .eq('status', 'published')
      .is('deleted_at', null);

    // Apply filters
    if (city) {
      query = query.eq('city', city);
    }

    if (from) {
      const fromDate = formatDateForQuery(from);
      query = query.gte('start_at', fromDate);
    }

    if (to) {
      const toDate = formatDateForQuery(to);
      query = query.lte('start_at', toDate);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Order by priority and date
    query = query
      .order('priority', { ascending: false })
      .order('start_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw mapError(error);
    }

    const items = (data || []).map(item => ({
      ...item,
      start_at: item.start_at ? parseUTCDate(item.start_at)?.toISOString() : undefined,
      end_at: item.end_at ? parseUTCDate(item.end_at)?.toISOString() : undefined,
    }));

    const result: FetchAgendaResult = {
      items,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };

    // Cache for static-like data (no search, specific timeframes)
    if (!search && (!from || !to)) {
      setCache(cacheKey, result);
    }

    return result;
  } catch (error) {
    throw error instanceof AgendaError ? error : mapError(error);
  }
};

/**
 * Get counts by city and total count
 */
export const fetchCounts = async (): Promise<AgendaCounts> => {
  const cacheKey = getCacheKey('fetchCounts', {});
  const cached = getFromCache<AgendaCounts>(cacheKey);
  if (cached) return cached;

  try {
    // Get current date to filter future events
    const now = new Date().toISOString();

    // Get city counts
    const { data: cityData, error: cityError } = await supabase
      .from('agenda_public')
      .select('city')
      .eq('status', 'published')
      .is('deleted_at', null)
      .gte('start_at', now);

    if (cityError) {
      throw mapError(cityError);
    }

    // Count by city
    const cityCounts = (cityData || []).reduce((acc, item) => {
      if (item.city) {
        acc[item.city] = (acc[item.city] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const cities: CityCounts[] = Object.entries(cityCounts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    const total = cityData?.length || 0;

    const result: AgendaCounts = {
      cities,
      total
    };

    // Cache for longer since counts change less frequently
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    throw error instanceof AgendaError ? error : mapError(error);
  }
};

/**
 * Get a single agenda item by slug
 */
export const getAgendaItem = async (slug: string): Promise<AgendaItem> => {
  if (!slug) {
    throw new AgendaError('Slug é obrigatório', 'INVALID_PARAMS');
  }

  const cacheKey = getCacheKey('getAgendaItem', { slug });
  const cached = getFromCache<AgendaItem>(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('agenda_public')
      .select(`
        *,
        venue:venues(id, name, address, city),
        organizer:organizers(id, name, site, instagram)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (error) {
      throw mapError(error);
    }

    const item: AgendaItem = {
      ...data,
      start_at: data.start_at ? parseUTCDate(data.start_at)?.toISOString() : undefined,
      end_at: data.end_at ? parseUTCDate(data.end_at)?.toISOString() : undefined,
    };

    // Cache individual items for longer
    setCache(cacheKey, item);

    return item;
  } catch (error) {
    throw error instanceof AgendaError ? error : mapError(error);
  }
};

/**
 * Get next and previous items for navigation
 */
export const getNextPrev = async (id: string, city?: string): Promise<NavigationResult> => {
  if (!id) {
    throw new AgendaError('ID é obrigatório', 'INVALID_PARAMS');
  }

  const cacheKey = getCacheKey('getNextPrev', { id, city });
  const cached = getFromCache<NavigationResult>(cacheKey);
  if (cached) return cached;

  try {
    // First get the current item to know its start_at
    const { data: currentItem, error: currentError } = await supabase
      .from('agenda_public')
      .select('start_at')
      .eq('id', id)
      .eq('status', 'published')
      .is('deleted_at', null)
      .single();

    if (currentError) {
      throw mapError(currentError);
    }

    const currentStartAt = currentItem.start_at;

    let baseQuery = supabase
      .from('agenda_public')
      .select('id, slug, title, start_at')
      .eq('status', 'published')
      .is('deleted_at', null);

    if (city) {
      baseQuery = baseQuery.eq('city', city);
    }

    // Get previous item (earlier date)
    const { data: prevData } = await baseQuery
      .lt('start_at', currentStartAt)
      .order('start_at', { ascending: false })
      .limit(1);

    // Get next item (later date)
    const { data: nextData } = await baseQuery
      .gt('start_at', currentStartAt)
      .order('start_at', { ascending: true })
      .limit(1);

    const result: NavigationResult = {
      previous: prevData && prevData.length > 0 ? {
        id: prevData[0].id,
        slug: prevData[0].slug,
        title: prevData[0].title,
        start_at: prevData[0].start_at ? parseUTCDate(prevData[0].start_at)?.toISOString() : undefined,
      } : null,
      next: nextData && nextData.length > 0 ? {
        id: nextData[0].id,
        slug: nextData[0].slug,
        title: nextData[0].title,
        start_at: nextData[0].start_at ? parseUTCDate(nextData[0].start_at)?.toISOString() : undefined,
      } : null
    };

    // Cache navigation results
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    throw error instanceof AgendaError ? error : mapError(error);
  }
};

// Cache management utilities
export const clearAgendaCache = (): void => {
  cache.clear();
};

export const invalidateAgendaCache = (pattern?: string): void => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};