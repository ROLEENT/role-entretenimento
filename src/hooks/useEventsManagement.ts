import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventFormData {
  title: string;
  slug?: string;
  description?: string;
  cover_url?: string;
  start_at?: string;
  end_at?: string;
  city: string;
  state: string;
  organizer_id?: string;
  venue_id?: string;
  status?: 'draft' | 'published';
  price_min?: number;
  price_max?: number;
}

export interface EventData extends EventFormData {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const useEventsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os eventos
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('[EVENTS MANAGEMENT] Buscando eventos...');
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizers(id, name),
          venues(id, name, city)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('[EVENTS MANAGEMENT] Erro ao buscar eventos:', error);
        throw error;
      }
      
      console.log('[EVENTS MANAGEMENT] Eventos encontrados:', data?.length);
      return data as EventData[];
    },
  });

  // Criar evento
  const createEvent = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      console.log('[EVENTS MANAGEMENT] Criando evento:', eventData);
      
      // Gerar slug automaticamente se não fornecido
      let slug = eventData.slug;
      if (!slug && eventData.title) {
        const { data: generatedSlug, error: slugError } = await supabase
          .rpc('generate_unique_slug', {
            base_text: eventData.title,
            table_name: 'events'
          });
        
        if (slugError) {
          console.error('[EVENTS MANAGEMENT] Erro ao gerar slug:', slugError);
          throw slugError;
        }
        
        slug = generatedSlug;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{ 
          ...eventData, 
          slug,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('[EVENTS MANAGEMENT] Erro ao criar evento:', error);
        throw error;
      }
      
      console.log('[EVENTS MANAGEMENT] Evento criado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento criado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[EVENTS MANAGEMENT] Erro na criação:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar evento',
        variant: 'destructive',
      });
    },
  });

  // Atualizar evento
  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventFormData> }) => {
      console.log('[EVENTS MANAGEMENT] Atualizando evento:', id, data);
      
      const updateData = {
        ...data,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { data: result, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[EVENTS MANAGEMENT] Erro ao atualizar evento:', error);
        throw error;
      }
      
      console.log('[EVENTS MANAGEMENT] Evento atualizado:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[EVENTS MANAGEMENT] Erro na atualização:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar evento',
        variant: 'destructive',
      });
    },
  });

  // Toggle status publicado/rascunho
  const togglePublished = useMutation({
    mutationFn: async (id: string) => {
      console.log('[EVENTS MANAGEMENT] Alterando status do evento:', id);
      
      const { data, error } = await supabase
        .rpc('admin_toggle_event_published', { p_event_id: id });

      if (error) {
        console.error('[EVENTS MANAGEMENT] Erro ao alterar status:', error);
        throw error;
      }
      
      console.log('[EVENTS MANAGEMENT] Status alterado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Sucesso',
        description: 'Status do evento alterado com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[EVENTS MANAGEMENT] Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao alterar status do evento',
        variant: 'destructive',
      });
    },
  });

  // Deletar evento
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      console.log('[EVENTS MANAGEMENT] Deletando evento:', id);
      
      const { data, error } = await supabase
        .rpc('admin_delete_event', { p_event_id: id });

      if (error) {
        console.error('[EVENTS MANAGEMENT] Erro ao deletar evento:', error);
        throw error;
      }
      
      console.log('[EVENTS MANAGEMENT] Evento deletado');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Sucesso',
        description: 'Evento excluído com sucesso!',
      });
    },
    onError: (error: any) => {
      console.error('[EVENTS MANAGEMENT] Erro ao deletar:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir evento',
        variant: 'destructive',
      });
    },
  });

  // Buscar evento por ID
  const getEvent = (id: string) => {
    return useQuery({
      queryKey: ['event', id],
      queryFn: async () => {
        console.log('[EVENTS MANAGEMENT] Buscando evento por ID:', id);
        
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            organizers(id, name),
            venues(id, name, city)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('[EVENTS MANAGEMENT] Erro ao buscar evento:', error);
          throw error;
        }
        
        console.log('[EVENTS MANAGEMENT] Evento encontrado:', data);
        return data as EventData;
      },
      enabled: !!id,
    });
  };

  return {
    events,
    isLoading,
    error,
    createEvent: createEvent.mutateAsync,
    updateEvent: updateEvent.mutateAsync,
    togglePublished: togglePublished.mutateAsync,
    deleteEvent: deleteEvent.mutateAsync,
    getEvent,
    isCreating: createEvent.isPending,
    isUpdating: updateEvent.isPending,
    isToggling: togglePublished.isPending,
    isDeleting: deleteEvent.isPending,
  };
};