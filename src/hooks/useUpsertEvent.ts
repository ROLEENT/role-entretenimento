import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/lib/eventsApi";
import { EventFormData } from "@/schemas/eventSchema";
import { toast } from "sonner";

export function useUpsertEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventData, eventId }: { eventData: EventFormData; eventId?: string }) => {
      if (eventId) {
        return await eventsApi.updateEvent(eventId, eventData);
      } else {
        return await eventsApi.createEvent(eventData);
      }
    },
    onSuccess: () => {
      toast.success("Evento salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["unified-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar evento: ${error.message}`);
    },
  });
}