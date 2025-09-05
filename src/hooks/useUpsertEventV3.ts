import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { eventsApi } from "@/api/eventsApi";
import { eventDebugUtils } from "@/utils/eventDebugUtils";

export function useEventSeries() {
  const queryResult = useQuery({
    queryKey: ["event-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_series")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const createSeriesMutation = useMutation({
    mutationFn: async (seriesData: any) => {
      const { data, error } = await supabase
        .from("event_series")
        .insert(seriesData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return {
    ...queryResult,
    createSeries: createSeriesMutation,
  };
}

export function useUpsertEventV3() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: any) => {
      try {
        console.log("🎪 Iniciando salvamento do evento:", { 
          hasId: !!eventData.id, 
          title: eventData.title,
          status: eventData.status 
        });

        // Validar dados antes de enviar
        const validation = eventDebugUtils.validateEventData(eventData);
        if (!validation.isValid) {
          throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        // Usar dados limpos da validação
        const cleanEventData = validation.cleanedData;

        if (cleanEventData.id) {
          // Update existing event
          console.log("🔄 Atualizando evento existente:", cleanEventData.id);
          const result = await eventsApi.updateEvent(cleanEventData.id, cleanEventData);
          console.log("✅ Evento atualizado com sucesso:", result);
          return result;
        } else {
          // Create new event using the cascade RPC
          console.log("🆕 Criando novo evento com dados:", {
            event_data: cleanEventData,
            partners: cleanEventData.partners?.length || 0,
            lineup_slots: cleanEventData.lineup_slots?.length || 0,
            performances: cleanEventData.performances?.length || 0,
            visual_artists: cleanEventData.visual_artists?.length || 0
          });
          
          const result = await eventsApi.createEvent({
            event_data: cleanEventData,
            partners: cleanEventData.partners || [],
            lineup_slots: cleanEventData.lineup_slots || [],
            performances: cleanEventData.performances || [],
            visual_artists: cleanEventData.visual_artists || []
          });
          
          console.log("✅ Evento criado com sucesso. ID:", result);
          return result;
        }
      } catch (error) {
        console.error("❌ Erro detalhado ao salvar evento:", {
          error: error,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          stack: error instanceof Error ? error.stack : undefined,
          eventData: {
            id: eventData.id,
            title: eventData.title,
            status: eventData.status
          }
        });
        
        // Re-throw com mensagem mais clara
        if (error instanceof Error) {
          throw new Error(`Falha ao salvar evento: ${error.message}`);
        } else {
          throw new Error('Erro desconhecido ao salvar evento');
        }
      }
    },
    onSuccess: (result) => {
      console.log("🎉 Sucesso no salvamento, invalidando cache...");
      toast.success("Evento salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (error: Error) => {
      console.error("🚨 Erro final na mutation:", error);
      toast.error(`Erro ao salvar evento: ${error.message}`);
    },
  });
}