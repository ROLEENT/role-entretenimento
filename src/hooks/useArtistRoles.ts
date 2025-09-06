import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArtistRole {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export function useArtistRoles(search?: string) {
  return useQuery({
    queryKey: ['artist-roles', search],
    queryFn: async () => {
      let query = supabase
        .from('artist_roles_lookup')
        .select('*')
        .order('name');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ArtistRole[];
    },
  });
}

export function useCreateArtistRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.rpc('ensure_artist_role', { p_name: name });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-roles'] });
      toast.success('Função criada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar função: ' + error.message);
    },
  });
}

export function useUpdateArtistRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, is_active }: { id: string; name: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('artist_roles_lookup')
        .update({ name, is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-roles'] });
      toast.success('Função atualizada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar função: ' + error.message);
    },
  });
}

export function useDeleteArtistRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('artist_roles_lookup')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-roles'] });
      toast.success('Função excluída com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao excluir função: ' + error.message);
    },
  });
}