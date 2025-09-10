import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useState } from 'react';
import { useVenueCompletionStatus } from './useCompletionStatus';
import { createAdminClient, handleAdminError } from '@/lib/adminClient';
import { toast } from 'sonner';

interface UseAdminVenuesDataProps {
  search?: string;
  status?: string;
  city?: string;
  completion?: string;
}

// Filter interface
export interface VenueFilters {
  search?: string;
  status?: string;
  city?: string;
  completion?: string;
}

export const useAdminVenuesData = ({ search, status, city, completion }: UseAdminVenuesDataProps = {}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<VenueFilters>({
    search,
    status,
    city,
    completion,
  });

  const venuesQuery = useQuery({
    queryKey: ['admin-venues', filters],
    queryFn: async () => {
      let query = supabase
        .from('venues')
        .select(`
          *,
          city:cities(name, slug)
        `)
        .is('deleted_at', null) // Only non-deleted venues
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching venues:', error);
        throw new Error('Erro ao carregar locais');
      }

      return data || [];
    },
  });

  // Apply completion filter client-side
  const filteredVenues = useMemo(() => {
    if (!venuesQuery.data || !filters.completion || filters.completion === 'all') {
      return venuesQuery.data;
    }

    return venuesQuery.data.filter(venue => {
      const { status: completionStatus } = useVenueCompletionStatus(venue);
      return completionStatus === filters.completion;
    });
  }, [venuesQuery.data, filters.completion]);

  const citiesQuery = useQuery({
    queryKey: ['venues-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('city')
        .not('city', 'is', null)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching venue cities:', error);
        throw new Error('Erro ao carregar cidades');
      }

      // Get unique cities
      const uniqueCities = [...new Set(data?.map(item => item.city) || [])];
      return uniqueCities.filter(Boolean);
    },
  });

  // Mutations for data manipulation
  const duplicateVenueMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const adminClient = await createAdminClient();
      
      const { data: originalVenue, error: fetchError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (fetchError) throw fetchError;
      if (!originalVenue) throw new Error('Local não encontrado');

      // Create a copy with modified name and slug
      const { id, created_at, updated_at, slug, ...venueData } = originalVenue;
      const duplicatedVenue = {
        ...venueData,
        name: `${venueData.name} - Cópia`,
        slug: `${slug || venueData.name.toLowerCase().replace(/\s+/g, '-')}-copia-${Date.now()}`,
      };

      const response = await adminClient.restCall('venues', {
        method: 'POST',
        body: JSON.stringify(duplicatedVenue),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      toast.success('Local duplicado com sucesso!');
    },
    onError: (error) => {
      const errorMessage = handleAdminError(error);
      console.error('Erro ao duplicar local:', error);
      toast.error(errorMessage);
    },
  });

  const updateVenueStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const adminClient = await createAdminClient();
      
      const response = await adminClient.restCall(`venues?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status, 
          updated_at: new Date().toISOString(),
          deleted_at: status === 'inactive' ? new Date().toISOString() : null
        }),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      toast.success('Status do local atualizado com sucesso!');
    },
    onError: (error) => {
      const errorMessage = handleAdminError(error);
      console.error('Erro ao atualizar status:', error);
      toast.error(errorMessage);
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: async (venueId: string) => {
      const adminClient = await createAdminClient();
      
      // Soft delete - mark as deleted instead of hard delete
      const response = await adminClient.restCall(`venues?id=eq.${venueId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          deleted_at: new Date().toISOString(),
          status: 'inactive',
          updated_at: new Date().toISOString()
        }),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      toast.success('Local excluído com sucesso!');
    },
    onError: (error) => {
      const errorMessage = handleAdminError(error);
      console.error('Erro ao excluir local:', error);
      toast.error(errorMessage);
    },
  });

  // Actions
  const updateFilters = (newFilters: Partial<VenueFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const duplicateVenue = (venueId: string) => {
    duplicateVenueMutation.mutate(venueId);
  };

  const updateVenueStatus = (id: string, status: string) => {
    updateVenueStatusMutation.mutate({ id, status });
  };

  const deleteVenue = (venueId: string) => {
    deleteVenueMutation.mutate(venueId);
  };

  return {
    // Data
    venues: filteredVenues,
    cities: citiesQuery.data,
    filters,
    
    // States
    isLoading: venuesQuery.isLoading || citiesQuery.isLoading,
    error: venuesQuery.error || citiesQuery.error,
    isDuplicating: duplicateVenueMutation.isPending,
    isUpdatingStatus: updateVenueStatusMutation.isPending,
    isDeleting: deleteVenueMutation.isPending,
    
    // Actions
    updateFilters,
    duplicateVenue,
    updateVenueStatus,
    deleteVenue,
    refetch: venuesQuery.refetch,
  };
};