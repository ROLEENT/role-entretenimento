import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUpsertEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: any) => {
      throw new Error("Event upsert not implemented yet");
    },
    onSuccess: () => {
      toast.success("Evento salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar evento: ${error.message}`);
    },
  });
}