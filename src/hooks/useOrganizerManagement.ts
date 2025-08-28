import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OrganizerFormData } from '@/lib/organizerSchema';
import { useToast } from '@/hooks/use-toast';

export interface OrganizerData extends OrganizerFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

export const useOrganizerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizers = [], isLoading, error } = useQuery({
    queryKey: ['organizers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OrganizerData[];
    },
  });

  const createOrganizer = useMutation({
    mutationFn: async (organizerData: OrganizerFormData) => {
      // Generate slug from name
      const slug = organizerData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('organizers')
        .insert([{ ...organizerData, slug }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizers'] });
      toast({
        title: 'Sucesso',
        description: 'Organizador criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar organizador',
        variant: 'destructive',
      });
    },
  });

  const updateOrganizer = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OrganizerFormData> }) => {
      const { data: result, error } = await supabase
        .from('organizers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizers'] });
      toast({
        title: 'Sucesso',
        description: 'Organizador atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar organizador',
        variant: 'destructive',
      });
    },
  });

  const deleteOrganizer = useMutation({
    mutationFn: async (id: string) => {
      console.log('[ORGANIZER MANAGEMENT] Deletando organizador:', id);
      
      const { data, error } = await supabase
        .rpc('admin_delete_organizer', { p_organizer_id: id });

      if (error) {
        console.error('[ORGANIZER MANAGEMENT] Erro ao deletar organizador:', error);
        throw error;
      }
      
      console.log('[ORGANIZER MANAGEMENT] Organizador deletado');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizers'] });
      toast({
        title: 'Sucesso',
        description: 'Organizador excluído com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[ORGANIZER MANAGEMENT] Erro na exclusão:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir organizador',
        variant: 'destructive',
      });
    },
  });

  const getOrganizer = (id: string) => {
    return useQuery({
      queryKey: ['organizer', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('organizers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as OrganizerData;
      },
      enabled: !!id,
    });
  };

  return {
    organizers,
    isLoading,
    error,
    createOrganizer: createOrganizer.mutateAsync,
    updateOrganizer: updateOrganizer.mutateAsync,
    deleteOrganizer: deleteOrganizer.mutateAsync,
    getOrganizer,
    isCreating: createOrganizer.isPending,
    isUpdating: updateOrganizer.isPending,
    isDeleting: deleteOrganizer.isPending,
  };
};