import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventFormV3 } from '@/schemas/event-v3';

interface UpsertEventV3Options {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useUpsertEventV3 = (options?: UpsertEventV3Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventFormV3) => {
      try {
        // Preparar dados para o backend
        const eventData = {
          title: data.title,
          slug: data.slug,
          city: data.city,
          venue_id: data.venue_id,
          organizer_ids: data.organizer_ids,
          supporters: data.supporters,
          sponsors: data.sponsors,
          cover_url: data.cover_url,
          alt_text: data.cover_alt,
          starts_at: data.start_utc,
          end_at: data.end_utc,
          artists_names: data.artists_names,
          performances: data.performances,
          visual_art: data.visual_art,
          highlight_type: data.highlight_type,
          is_sponsored: data.is_sponsored,
          ticketing: data.ticketing,
          links: data.links,
          summary: data.description,
          tags: data.tags,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
          og_image_url: data.og_image_url,
          status: data.status,
          publish_at: data.publish_at,
          published_at: data.published_at,
        };

        // Usar upsert com conflict resolution no slug
        const { data: result, error } = await supabase
          .from('agenda_itens')
          .upsert(eventData, {
            onConflict: 'slug',
            ignoreDuplicates: false
          })
          .select('*')
          .single();

        if (error) throw error;

        // Se há série configurada, criar vinculação
        if (data.series_id && data.edition_number) {
          await syncEventSeries(result.id, data.series_id, data.edition_number);
        }

        return result;
      } catch (error: any) {
        console.error('Error upserting event:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-event', data.id] });
      
      toast.success('Evento salvo com sucesso!');
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      
      let errorMessage = 'Erro ao salvar evento';
      
      if (error.code === '23505') {
        errorMessage = 'Já existe um evento com este slug';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      options?.onError?.(error);
    },
  });
};

// Função auxiliar para gerenciar série de eventos
const syncEventSeries = async (eventId: string, seriesId: string, editionNumber: number) => {
  try {
    // Remover vínculo anterior se existir
    await supabase
      .from('event_series_items')
      .delete()
      .eq('event_id', eventId);

    // Criar novo vínculo
    const { error } = await supabase
      .from('event_series_items')
      .insert({
        series_id: seriesId,
        event_id: eventId,
        edition_number: editionNumber,
      });

    if (error) throw error;
  } catch (error: any) {
    console.error('Error syncing event series:', error);
    
    if (error.code === '23505') {
      throw new Error(`Já existe uma edição #${editionNumber} nesta série`);
    }
    throw error;
  }
};

// Hook para gerenciar séries de eventos
export const useEventSeries = () => {
  const queryClient = useQueryClient();

  const createSeries = useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from('event_series')
        .insert(data)
        .select('*')
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-series'] });
      toast.success('Série criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Error creating series:', error);
      toast.error('Erro ao criar série');
    },
  });

  return { createSeries };
};