import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VenueFormData } from '@/lib/venueSchema';
import { useToast } from '@/hooks/use-toast';

export interface VenueData extends VenueFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

export const useVenueManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: venues = [], isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VenueData[];
    },
  });

  const createVenue = useMutation({
    mutationFn: async (venueData: VenueFormData) => {
      // Generate slug from name
      const slug = venueData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('venues')
        .insert([{ ...venueData, slug }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: 'Sucesso',
        description: 'Local criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar local',
        variant: 'destructive',
      });
    },
  });

  const updateVenue = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VenueFormData> }) => {
      const { data: result, error } = await supabase
        .from('venues')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: 'Sucesso',
        description: 'Local atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar local',
        variant: 'destructive',
      });
    },
  });

  const deleteVenue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: 'Sucesso',
        description: 'Local excluído com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir local',
        variant: 'destructive',
      });
    },
  });

  const getVenue = (id: string) => {
    return useQuery({
      queryKey: ['venue', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as VenueData;
      },
      enabled: !!id,
    });
  };

  return {
    venues,
    isLoading,
    error,
    createVenue: createVenue.mutateAsync,
    updateVenue: updateVenue.mutateAsync,
    deleteVenue: deleteVenue.mutateAsync,
    getVenue,
    isCreating: createVenue.isPending,
    isUpdating: updateVenue.isPending,
    isDeleting: deleteVenue.isPending,
  };
};