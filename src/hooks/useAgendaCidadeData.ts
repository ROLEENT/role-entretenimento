import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCityQueryValue, isCapitalSlug } from '@/lib/cityToSlug';

export interface AgendaCidadeItem {
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
  tags?: string[];
}

interface UseAgendaCidadeDataParams {
  city: string;
  search?: string;
  period?: string;
  tags?: string[];
  page?: number;
}

export const useAgendaCidadeData = (params: UseAgendaCidadeDataParams) => {
  const [items, setItems] = useState<AgendaCidadeItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 18;

  const getDateRange = useCallback((period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'hoje':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { start: today, end: tomorrow };
        
      case 'fim-de-semana': {
        const dayOfWeek = now.getDay();
        // Find next Friday or current Friday if it's Friday/Saturday/Sunday
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
        // Default to next 30 days
        const thirtyDays = new Date(today);
        thirtyDays.setDate(today.getDate() + 30);
        return { start: today, end: thirtyDays };
    }
  }, []);

  const fetchItems = useCallback(async () => {
    if (!params.city) {
      setError('Cidade não especificada');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convert slug to city query value
      const cityQueryValue = getCityQueryValue(params.city);
      const isCapital = isCapitalSlug(params.city);
      const { start, end } = getDateRange(params.period || 'proximos-7-dias');
      const offset = ((params.page || 1) - 1) * itemsPerPage;

      // Build query for agenda_itens
      let query = supabase
        .from('agenda_itens')
        .select('id, title, city, cover_url, start_at, end_at, tags, slug, alt_text, priority', { count: 'exact' })
        .eq('status', 'published')
        .is('deleted_at', null)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('priority', { ascending: false })
        .order('start_at', { ascending: true })
        .range(offset, offset + itemsPerPage - 1);

      // Filter by city - exact match for capitals, ilike for other cities
      if (isCapital) {
        query = query.eq('city', cityQueryValue);
      } else {
        query = query.ilike('city', cityQueryValue);
      }

      // Add search filter
      if (params.search && params.search.trim()) {
        query = query.ilike('title', `%${params.search.trim()}%`);
      }

      // Add tags filter
      if (params.tags && params.tags.length > 0) {
        query = query.overlaps('tags', params.tags);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setItems((data as AgendaCidadeItem[]) || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (err) {
      console.error('Error fetching agenda items:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      // Não re-fazer fetch em caso de erro - empty state
      setItems([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [params.city, params.search, params.period, params.tags, params.page, getDateRange]);

  const fetchAvailableTags = useCallback(async () => {
    if (!params.city) return;

    try {
      // Convert slug to city query value  
      const cityQueryValue = getCityQueryValue(params.city);
      const isCapital = isCapitalSlug(params.city);
      const { start, end } = getDateRange(params.period || 'proximos-7-dias');

      let tagsQuery = supabase
        .from('agenda_itens')
        .select('tags')
        .eq('status', 'published')
        .is('deleted_at', null)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString());

      // Filter by city - exact match for capitals, ilike for other cities
      if (isCapital) {
        tagsQuery = tagsQuery.eq('city', cityQueryValue);
      } else {
        tagsQuery = tagsQuery.ilike('city', cityQueryValue);
      }

      const { data, error: fetchError } = await tagsQuery;

      if (fetchError) throw fetchError;

      // Extract unique tags
      const tagSet = new Set<string>();
      (data || []).forEach((item) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => tagSet.add(tag));
        }
      });

      setAvailableTags(Array.from(tagSet).sort());
    } catch (err) {
      console.error('Error fetching available tags:', err);
      // Não limpar tags em caso de erro - manter estado anterior
    }
  }, [params.city, params.period, getDateRange]);

  const refetch = useCallback(async () => {
    await Promise.all([
      fetchItems(),
      fetchAvailableTags(),
    ]);
  }, [fetchItems, fetchAvailableTags]);

  useEffect(() => {
    if (params.city) {
      refetch();
    }
  }, [refetch, params.city]);

  return {
    items,
    totalCount,
    totalPages,
    availableTags,
    isLoading,
    error,
    refetch,
  };
};