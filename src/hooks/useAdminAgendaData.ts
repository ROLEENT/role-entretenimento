import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AgendaItemInput } from '@/schemas/agenda';

interface AgendaFilters {
  search: string;
  status: string;
  city: string;
  dateRange: { from: Date | null; to: Date | null };
  tags: string[];
}

interface AgendaStats {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  archived: number;
  thisWeek: number;
}

interface AgendaDataResult {
  items: AgendaItemInput[];
  stats: AgendaStats;
  total: number;
  published: number;
  drafts: number;
  thisWeek: number;
}

export function useAdminAgendaData(filters: AgendaFilters) {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Fetch agenda items with filters
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-agenda', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('agenda_itens')
        .select(`
          *,
          venues:venue_id(name),
          organizers:organizer_id(name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.dateRange.from) {
        query = query.gte('starts_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange.to) {
        query = query.lte('starts_at', filters.dateRange.to.toISOString());
      }

      if (filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data: items, error, count } = await query;

      if (error) throw error;

      return {
        items: items || [],
        count: count || 0
      };
    },
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Fetch stats separately for better performance
  const { data: stats } = useQuery({
    queryKey: ['admin-agenda-stats'],
    queryFn: async () => {
      // Get total counts by status
      const { data: statusCounts } = await supabase
        .from('agenda_itens')
        .select('status')
        .is('deleted_at', null);

      // Get this week's events
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const { count: thisWeekCount } = await supabase
        .from('agenda_itens')
        .select('*', { count: 'exact', head: true })
        .gte('starts_at', startOfWeek.toISOString())
        .is('deleted_at', null);

      // Calculate stats
      const total = statusCounts?.length || 0;
      const published = statusCounts?.filter(item => item.status === 'published').length || 0;
      const drafts = statusCounts?.filter(item => item.status === 'draft').length || 0;
      const scheduled = statusCounts?.filter(item => item.status === 'scheduled').length || 0;
      const archived = statusCounts?.filter(item => item.status === 'archived').length || 0;

      return {
        total,
        published,
        drafts,
        scheduled,
        archived,
        thisWeek: thisWeekCount || 0
      };
    },
    staleTime: 60000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Combine data for return
  const result: AgendaDataResult = useMemo(() => ({
    items: data?.items || [],
    stats: stats || {
      total: 0,
      published: 0,
      drafts: 0,
      scheduled: 0,
      archived: 0,
      thisWeek: 0
    },
    total: stats?.total || 0,
    published: stats?.published || 0,
    drafts: stats?.drafts || 0,
    thisWeek: stats?.thisWeek || 0
  }), [data, stats]);

  return {
    data: result,
    loading: isLoading,
    error,
    refetch,
    page,
    setPage,
    totalPages: Math.ceil((data?.count || 0) / pageSize)
  };
}