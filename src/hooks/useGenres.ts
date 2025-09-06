import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

export function useGenres(search?: string) {
  return useQuery({
    queryKey: ['genres', search],
    queryFn: async () => {
      let query = supabase
        .from('genres')
        .select('*')
        .order('name');

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Genre[];
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.rpc('ensure_genre', { p_name: name });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Gênero criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar gênero: ' + error.message);
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, is_active }: { id: string; name: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('genres')
        .update({ name, is_active, active: is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Gênero atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar gênero: ' + error.message);
    },
  });
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('genres')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      toast.success('Gênero excluído com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao excluir gênero: ' + error.message);
    },
  });
}