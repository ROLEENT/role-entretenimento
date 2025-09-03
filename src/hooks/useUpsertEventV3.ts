import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      throw new Error("Event V3 upsert not implemented yet");
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