import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminAuth } from './useAdminAuth';

interface EventFilters {
  search: string;
  status: string;
  city: string;
}

export const useAdminEventsData = () => {
  const queryClient = useQueryClient();
  const { callAdminRpc, isAdmin } = useAdminAuth();
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    status: 'all',
    city: 'all'
  });

  // Fetch events with filters
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['admin-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!isAdmin) {
        throw new Error('Acesso negado: permissões de admin necessárias');
      }
      
      return await callAdminRpc('admin_delete_event', {
        p_event_id: eventId
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      
      // Verificar se a resposta indica sucesso
      if (data && typeof data === 'object' && 'message' in data) {
        toast.success(data.message || 'Evento removido com sucesso');
      } else {
        toast.success('Evento removido com sucesso');
      }
    },
    onError: (error: any) => {
      console.error('Error deleting event:', error);
      
      // Extrair mensagem de erro mais específica
      const errorMessage = error?.message || 'Erro ao remover evento';
      toast.error(errorMessage);
    },
  });

  const updateFilters = (newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const deleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

  return {
    // Data
    events,
    filters,
    
    // Loading states
    isLoading,
    error,
    isDeleting: deleteEventMutation.isPending,
    
    // Actions
    updateFilters,
    deleteEvent,
  };
};