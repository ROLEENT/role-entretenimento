import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ArtistFilters {
  search: string;
  status: string;
  city: string;
  artistType: string;
}

export const useAdminArtistsData = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ArtistFilters>({
    search: '',
    status: 'all',
    city: 'all',
    artistType: 'all'
  });

  // Fetch artists with filters
  const { data: artists, isLoading, error } = useQuery({
    queryKey: ['admin-artists', filters],
    queryFn: async () => {
      let query = supabase
        .from('artists')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters.search) {
        query = query.or(`stage_name.ilike.%${filters.search}%,name.ilike.%${filters.search}%,bio_short.ilike.%${filters.search}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }

      if (filters.artistType && filters.artistType !== 'all') {
        query = query.eq('artist_type', filters.artistType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch unique cities for filter
  const { data: cities } = useQuery({
    queryKey: ['artist-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('city')
        .not('city', 'is', null);
      
      if (error) throw error;
      
      const uniqueCities = [...new Set(data.map(item => item.city))].filter(Boolean);
      return uniqueCities.sort();
    },
  });

  // Fetch artist types for filter
  const { data: artistTypes } = useQuery({
    queryKey: ['artist-types-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_types')
        .select('id, name')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Duplicate artist mutation
  const duplicateArtistMutation = useMutation({
    mutationFn: async (artistId: string) => {
      const { data: artist, error: fetchError } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();

      if (fetchError) throw fetchError;

      // Remove id and update name for duplicate
      const { id, created_at, updated_at, slug, ...artistData } = artist;
      const duplicateData = {
        ...artistData,
        stage_name: `${artistData.stage_name} (Cópia)`,
        slug: `${artistData.slug || artistData.stage_name.toLowerCase().replace(/\s+/g, '-')}-copia-${Date.now()}`,
      };

      const { data, error } = await supabase
        .from('artists')
        .insert(duplicateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
      toast.success('Artista duplicado com sucesso');
    },
    onError: (error) => {
      console.error('Error duplicating artist:', error);
      toast.error('Erro ao duplicar artista');
    },
  });

  // Update artist status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ artistId, status }: { artistId: string; status: string }) => {
      const { data, error } = await supabase
        .from('artists')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', artistId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating artist status:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  // Delete artist mutation
  const deleteArtistMutation = useMutation({
    mutationFn: async (artistId: string) => {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistId);

      if (error) throw error;
      return artistId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] });
      toast.success('Artista removido com sucesso');
    },
    onError: (error) => {
      console.error('Error deleting artist:', error);
      toast.error('Erro ao remover artista');
    },
  });

  const updateFilters = (newFilters: Partial<ArtistFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const duplicateArtist = (artistId: string) => {
    duplicateArtistMutation.mutate(artistId);
  };

  const updateArtistStatus = (artistId: string, status: string) => {
    updateStatusMutation.mutate({ artistId, status });
  };

  const deleteArtist = (artistId: string) => {
    deleteArtistMutation.mutate(artistId);
  };

  return {
    // Data
    artists,
    cities,
    artistTypes,
    filters,
    
    // Loading states
    isLoading,
    error,
    isDuplicating: duplicateArtistMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteArtistMutation.isPending,
    
    // Actions
    updateFilters,
    duplicateArtist,
    updateArtistStatus,
    deleteArtist,
  };
};