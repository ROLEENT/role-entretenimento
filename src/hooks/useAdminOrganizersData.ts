import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrganizerFilters {
  search: string;
  status: string;
  city: string;
  organizerType: string;
}

export const useAdminOrganizersData = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OrganizerFilters>({
    search: '',
    status: 'all',
    city: 'all',
    organizerType: 'all'
  });

  // Fetch organizers with filters
  const { data: organizers, isLoading, error } = useQuery({
    queryKey: ['admin-organizers', filters],
    queryFn: async () => {
      let query = supabase
        .from('organizers')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,bio_short.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.city && filters.city !== 'all') {
        query = query.eq('city_id', filters.city);
      }

      if (filters.organizerType && filters.organizerType !== 'all') {
        query = query.eq('type', filters.organizerType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch unique cities for filter
  const { data: cities } = useQuery({
    queryKey: ['organizer-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch organizer types for filter
  const { data: organizerTypes } = useQuery({
    queryKey: ['organizer-types'],
    queryFn: async () => {
      // Return static organizer types based on the MinimalOrganizerSchema
      return [
        { id: 'organizador', name: 'Organizador' },
        { id: 'produtora', name: 'Produtora' },
        { id: 'coletivo', name: 'Coletivo' },
        { id: 'selo', name: 'Selo' },
      ];
    },
  });

  // Duplicate organizer mutation
  const duplicateOrganizerMutation = useMutation({
    mutationFn: async (organizerId: string) => {
      const { data: organizer, error: fetchError } = await supabase
        .from('organizers')
        .select('*')
        .eq('id', organizerId)
        .single();

      if (fetchError) throw fetchError;

      // Remove id and update name for duplicate
      const { id, created_at, updated_at, slug, ...organizerData } = organizer;
      const duplicateData = {
        ...organizerData,
        name: `${organizerData.name} (Cópia)`,
        slug: `${organizerData.slug || organizerData.name.toLowerCase().replace(/\s+/g, '-')}-copia-${Date.now()}`,
      };

      const { data, error } = await supabase
        .from('organizers')
        .insert(duplicateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizers'] });
      toast.success('Organizador duplicado com sucesso');
    },
    onError: (error) => {
      console.error('Error duplicating organizer:', error);
      toast.error('Erro ao duplicar organizador');
    },
  });

  // Update organizer status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ organizerId, status }: { organizerId: string; status: string }) => {
      const { data, error } = await supabase
        .from('organizers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', organizerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizers'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating organizer status:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  // Delete organizer mutation
  const deleteOrganizerMutation = useMutation({
    mutationFn: async (organizerId: string) => {
      const { error } = await supabase
        .from('organizers')
        .delete()
        .eq('id', organizerId);

      if (error) throw error;
      return organizerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizers'] });
      toast.success('Organizador removido com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting organizer:', error);
      toast.error('Erro ao remover organizador');
    },
  });

  const updateFilters = (newFilters: Partial<OrganizerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const duplicateOrganizer = (organizerId: string) => {
    duplicateOrganizerMutation.mutate(organizerId);
  };

  const updateOrganizerStatus = (organizerId: string, status: string) => {
    updateStatusMutation.mutate({ organizerId, status });
  };

  const deleteOrganizer = (organizerId: string) => {
    deleteOrganizerMutation.mutate(organizerId);
  };

  return {
    // Data
    organizers,
    cities,
    organizerTypes,
    filters,
    
    // Loading states
    isLoading,
    error,
    isDuplicating: duplicateOrganizerMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteOrganizerMutation.isPending,
    
    // Actions
    updateFilters,
    duplicateOrganizer,
    updateOrganizerStatus,
    deleteOrganizer,
  };
};