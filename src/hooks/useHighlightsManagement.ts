import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HighlightFormData {
  title: string;
  slug?: string;
  summary?: string;
  cover_url?: string;
  city: string;
  start_at?: string;
  end_at?: string;
  status?: 'draft' | 'published';
}

export interface HighlightData extends HighlightFormData {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const useHighlightsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os highlights
  const { data: highlights = [], isLoading, error } = useQuery({
    queryKey: ['highlights'],
    queryFn: async () => {
      console.log('[HIGHLIGHTS MANAGEMENT] Buscando highlights...');
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('[HIGHLIGHTS MANAGEMENT] Erro ao buscar highlights:', error);
        throw error;
      }
      
      console.log('[HIGHLIGHTS MANAGEMENT] Highlights encontrados:', data?.length);
      return data as HighlightData[];
    },
  });

  // Criar highlight
  const createHighlight = useMutation({
    mutationFn: async (highlightData: HighlightFormData) => {
      console.log('[HIGHLIGHTS MANAGEMENT] Criando highlight:', highlightData);
      
      // Gerar slug automaticamente se não fornecido
      let slug = highlightData.slug;
      if (!slug && highlightData.title) {
        const { data: generatedSlug, error: slugError } = await supabase
          .rpc('generate_unique_slug', {
            base_text: highlightData.title,
            table_name: 'highlights'
          });
        
        if (slugError) {
          console.error('[HIGHLIGHTS MANAGEMENT] Erro ao gerar slug:', slugError);
          throw slugError;
        }
        
        slug = generatedSlug;
      }

      const { data, error } = await supabase
        .from('highlights')
        .insert([{ 
          ...highlightData, 
          slug,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('[HIGHLIGHTS MANAGEMENT] Erro ao criar highlight:', error);
        throw error;
      }
      
      console.log('[HIGHLIGHTS MANAGEMENT] Highlight criado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      toast({
        title: 'Sucesso',
        description: 'Highlight criado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[HIGHLIGHTS MANAGEMENT] Erro na criação:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar highlight',
        variant: 'destructive',
      });
    },
  });

  // Atualizar highlight
  const updateHighlight = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HighlightFormData> }) => {
      console.log('[HIGHLIGHTS MANAGEMENT] Atualizando highlight:', id, data);
      
      const updateData = {
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data: result, error } = await supabase
        .from('highlights')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[HIGHLIGHTS MANAGEMENT] Erro ao atualizar highlight:', error);
        throw error;
      }
      
      console.log('[HIGHLIGHTS MANAGEMENT] Highlight atualizado:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      toast({
        title: 'Sucesso',
        description: 'Highlight atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[HIGHLIGHTS MANAGEMENT] Erro na atualização:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar highlight',
        variant: 'destructive',
      });
    },
  });

  // Toggle status publicado/rascunho
  const togglePublished = useMutation({
    mutationFn: async (id: string) => {
      console.log('[HIGHLIGHTS MANAGEMENT] Alterando status do highlight:', id);
      
      const { data, error } = await supabase
        .rpc('admin_toggle_highlight_published', { p_highlight_id: id });

      if (error) {
        console.error('[HIGHLIGHTS MANAGEMENT] Erro ao alterar status:', error);
        throw error;
      }
      
      console.log('[HIGHLIGHTS MANAGEMENT] Status alterado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      toast({
        title: 'Sucesso',
        description: 'Status do highlight alterado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[HIGHLIGHTS MANAGEMENT] Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao alterar status do highlight',
        variant: 'destructive',
      });
    },
  });

  // Deletar highlight
  const deleteHighlight = useMutation({
    mutationFn: async (id: string) => {
      console.log('[HIGHLIGHTS MANAGEMENT] Deletando highlight:', id);
      
      const { data, error } = await supabase
        .rpc('admin_delete_highlight', { p_highlight_id: id });

      if (error) {
        console.error('[HIGHLIGHTS MANAGEMENT] Erro ao deletar highlight:', error);
        throw error;
      }
      
      console.log('[HIGHLIGHTS MANAGEMENT] Highlight deletado');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights'] });
      toast({
        title: 'Sucesso',
        description: 'Highlight excluído com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[HIGHLIGHTS MANAGEMENT] Erro ao deletar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir highlight',
        variant: 'destructive',
      });
    },
  });

  // Buscar highlight por ID
  const getHighlight = (id: string) => {
    return useQuery({
      queryKey: ['highlight', id],
      queryFn: async () => {
        console.log('[HIGHLIGHTS MANAGEMENT] Buscando highlight por ID:', id);
        
        const { data, error } = await supabase
          .from('highlights')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('[HIGHLIGHTS MANAGEMENT] Erro ao buscar highlight:', error);
          throw error;
        }
        
        console.log('[HIGHLIGHTS MANAGEMENT] Highlight encontrado:', data);
        return data as HighlightData;
      },
      enabled: !!id,
    });
  };

  return {
    highlights,
    isLoading,
    error,
    createHighlight: createHighlight.mutateAsync,
    updateHighlight: updateHighlight.mutateAsync,
    togglePublished: togglePublished.mutateAsync,
    deleteHighlight: deleteHighlight.mutateAsync,
    getHighlight,
    isCreating: createHighlight.isPending,
    isUpdating: updateHighlight.isPending,
    isToggling: togglePublished.isPending,
    isDeleting: deleteHighlight.isPending,
  };
};