"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventForm } from "@/schemas/event";
import { toast } from "sonner";

export const useUpsertEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventForm) => {
      console.log("Upserting event:", data);

      // Transform dates to proper format
      const eventData = {
        ...data,
        starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
        // Convert string UUIDs to proper format
        city_id: data.city_id || null,
        venue_id: data.venue_id || null,
        organizer_id: data.organizer_id || null,
        // Ensure arrays have proper defaults
        lineup: data.lineup || [],
        links: data.links || [],
        gallery: data.gallery || [],
      };

      const { data: result, error } = await supabase
        .from("agenda_itens")
        .upsert(eventData, { 
          onConflict: "id",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Event upsert error:", error);
        throw new Error(`Erro ao salvar evento: ${error.message}`);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.id] });
      toast.success("Evento salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Event save error:", error);
      toast.error(error.message || "Erro ao salvar evento");
    },
  });
};