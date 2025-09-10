import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';

interface AgendaFilters {
  search: string;
  status: string;
  city: string;
  dateRange: { from: Date | null; to: Date | null };
  tags: string[];
  showTrash?: boolean;
}

interface AgendaItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  city?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  visibility_type: 'curadoria' | 'recomendacao' | 'publico';
  starts_at?: string;
  end_at?: string;
  price_min?: number;
  price_max?: number;
  currency?: string;
  location_name?: string;
  address?: string;
  neighborhood?: string;
  ticket_url?: string;
  cover_url?: string;
  alt_text?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  published_at?: string;
}

interface AgendaStats {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  archived: number;
  thisWeek: number;
}

interface UseNewAdminAgendaDataResult {
  // Data
  items: AgendaItem[];
  stats: AgendaStats;
  
  // Pagination
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setPage: (page: number) => void;
  
  // Loading states
  loading: boolean;
  statsLoading: boolean;
  mutating: boolean;
  
  // Error handling
  error: any;
  
  // Actions
  refetch: () => void;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkRestore: (ids: string[]) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  duplicateItem: (id: string) => Promise<string>;
  exportData: (format: 'csv' | 'excel') => Promise<void>;
}

export function useNewAdminAgendaData(filters: AgendaFilters): UseNewAdminAgendaDataResult {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [mutating, setMutating] = useState(false);

  // Debounce search for better performance
  const [debouncedSearch] = useDebounce(filters.search, 300);

  // Create query key
  const createQueryKey = useCallback((filterOverrides: Partial<AgendaFilters> = {}) => [
    'admin-agenda-new',
    { ...filters, search: debouncedSearch, ...filterOverrides },
    page
  ], [filters, debouncedSearch, page]);

  // Fetch agenda items with robust filtering and pagination
  const { 
    data: agendaData, 
    isLoading: loading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: createQueryKey(),
    queryFn: async () => {
      let query = supabase
        .from('agenda_itens')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Filter by trash status
      if (filters.showTrash) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }

      // Apply search filter
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,summary.ilike.%${debouncedSearch}%,city.ilike.%${debouncedSearch}%`);
      }

      // Apply status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply city filter
      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      // Apply date range filters
      if (filters.dateRange.from) {
        query = query.gte('starts_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange.to) {
        query = query.lte('starts_at', filters.dateRange.to.toISOString());
      }

      // Apply tags filter
      if (filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: data || [],
        count: count || 0
      };
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch stats using RPC function
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-agenda-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_agenda_stats');
      
      if (error) throw error;
      
      return data as AgendaStats;
    },
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.rpc('bulk_delete_agenda_items', { 
        item_ids: ids 
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-new'] });
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-stats'] });
      toast({ 
        title: 'Sucesso', 
        description: 'Itens movidos para lixeira com sucesso' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao mover itens para lixeira',
        variant: 'destructive'
      });
    }
  });

  // Bulk restore mutation
  const bulkRestoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.rpc('bulk_restore_agenda_items', { 
        item_ids: ids 
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-new'] });
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-stats'] });
      toast({ 
        title: 'Sucesso', 
        description: 'Itens restaurados com sucesso' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao restaurar itens',
        variant: 'destructive'
      });
    }
  });

  // Bulk status update mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[], status: string }) => {
      const { error } = await supabase.rpc('bulk_update_agenda_status', { 
        item_ids: ids, 
        new_status: status 
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-new'] });
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-stats'] });
      toast({ 
        title: 'Sucesso', 
        description: 'Status atualizado com sucesso' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar status',
        variant: 'destructive'
      });
    }
  });

  // Duplicate item mutation
  const duplicateItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('duplicate_agenda_item', { 
        item_id: id 
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-new'] });
      queryClient.invalidateQueries({ queryKey: ['admin-agenda-stats'] });
      toast({ 
        title: 'Sucesso', 
        description: 'Item duplicado com sucesso' 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao duplicar item',
        variant: 'destructive'
      });
    }
  });

  // Exported functions
  const bulkDelete = useCallback(async (ids: string[]) => {
    setMutating(true);
    try {
      await bulkDeleteMutation.mutateAsync(ids);
    } finally {
      setMutating(false);
    }
  }, [bulkDeleteMutation]);

  const bulkRestore = useCallback(async (ids: string[]) => {
    setMutating(true);
    try {
      await bulkRestoreMutation.mutateAsync(ids);
    } finally {
      setMutating(false);
    }
  }, [bulkRestoreMutation]);

  const bulkUpdateStatus = useCallback(async (ids: string[], status: string) => {
    setMutating(true);
    try {
      await bulkUpdateStatusMutation.mutateAsync({ ids, status });
    } finally {
      setMutating(false);
    }
  }, [bulkUpdateStatusMutation]);

  const duplicateItem = useCallback(async (id: string): Promise<string> => {
    setMutating(true);
    try {
      return await duplicateItemMutation.mutateAsync(id);
    } finally {
      setMutating(false);
    }
  }, [duplicateItemMutation]);

  const exportData = useCallback(async (format: 'csv' | 'excel') => {
    try {
      toast({ 
        title: 'Iniciando export...', 
        description: `Gerando arquivo ${format.toUpperCase()}` 
      });
      
      // Fetch all data without pagination for export
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate CSV data
      const csvData = data?.map(item => ({
        Título: item.title,
        Status: item.status,
        Cidade: item.city,
        'Data de Início': item.starts_at,
        'Data de Fim': item.end_at,
        'Preço Mínimo': item.price_min,
        'Preço Máximo': item.price_max,
        'Local': item.location_name,
        'Endereço': item.address,
        'URL do Evento': item.ticket_url,
        Tags: item.tags?.join(', '),
        'Criado em': item.created_at,
        'Atualizado em': item.updated_at
      }));

      if (!csvData?.length) {
        toast({
          title: 'Aviso',
          description: 'Nenhum dado encontrado para export',
          variant: 'destructive'
        });
        return;
      }

      // Convert to CSV string
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => 
            JSON.stringify(row[header as keyof typeof row] || '')
          ).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `agenda-${format}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ 
        title: 'Sucesso', 
        description: `Arquivo ${format.toUpperCase()} baixado com sucesso` 
      });
    } catch (error: any) {
      toast({
        title: 'Erro no export',
        description: error.message || 'Erro ao gerar arquivo',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Return hook interface
  return {
    // Data
    items: agendaData?.items || [],
    stats: stats || {
      total: 0,
      published: 0,
      drafts: 0,
      scheduled: 0,
      archived: 0,
      thisWeek: 0
    },
    
    // Pagination
    page,
    totalPages: Math.ceil((agendaData?.count || 0) / pageSize),
    totalItems: agendaData?.count || 0,
    pageSize,
    setPage,
    
    // Loading states
    loading,
    statsLoading,
    mutating,
    
    // Error handling
    error,
    
    // Actions
    refetch,
    bulkDelete,
    bulkRestore,
    bulkUpdateStatus,
    duplicateItem,
    exportData
  };
}