import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  visibilityType: 'vitrine' | 'curadoria';
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

  const getDateRange = (period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { start: today, end: tomorrow };
        
      case 'weekend': {
        const dayOfWeek = now.getDay();
        const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
        const friday = new Date(today);
        friday.setDate(today.getDate() + daysUntilFriday);
        const monday = new Date(friday);
        monday.setDate(friday.getDate() + 3);
        return { start: friday, end: monday };
      }
        
      case 'week': {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        return { start: today, end: nextWeek };
      }
        
      case 'month': {
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: today, end: endOfMonth };
      }
        
      default:
        // Default to next 30 days
        const thirtyDays = new Date(today);
        thirtyDays.setDate(today.getDate() + 30);
        return { start: today, end: thirtyDays };
    }
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { start, end } = getDateRange(params.period || 'week');
      const offset = ((params.page || 1) - 1) * itemsPerPage;

      // Build query
      let query = supabase
        .from('agenda_public')
        .select('*', { count: 'exact' })
        .eq('city', params.city)
        .eq('status', 'published')
        .eq('visibility_type', params.visibilityType)
        .is('deleted_at', null)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('priority', { ascending: false })
        .order('start_at', { ascending: true })
        .range(offset, offset + itemsPerPage - 1);

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
      setItems([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      const { start, end } = getDateRange(params.period || 'week');

      const { data, error: fetchError } = await supabase
        .from('agenda_public')
        .select('tags')
        .eq('city', params.city)
        .eq('status', 'published')
        .is('deleted_at', null)
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString());

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
      setAvailableTags([]);
    }
  };

  const refetch = async () => {
    await Promise.all([
      fetchItems(),
      fetchAvailableTags(),
    ]);
  };

  useEffect(() => {
    if (params.city) {
      refetch();
    }
  }, [
    params.city,
    params.visibilityType,
    params.search,
    params.period,
    JSON.stringify(params.tags), // Use JSON.stringify for array comparison
    params.page,
  ]);

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