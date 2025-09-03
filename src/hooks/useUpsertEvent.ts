"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventFlexibleForm } from "@/schemas/event-flexible";
import { toast } from "sonner";

// Use the EventFlexibleForm type from schema

export const useUpsertEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EventFlexibleForm) => {
      console.log("Upserting event:", data);

      // Transform data to match the agenda_itens table structure
      const eventData = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        status: data.status || "draft",
        city_id: data.city_id || null,
        venue_id: data.venue_id || null,
        organizer_id: data.organizer_id || null,
        starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
        price_min: data.price_min || null,
        price_max: data.price_max || null,
        age_rating: data.age_rating || null,
        excerpt: data.excerpt || null,
        content: data.content || null,
        cover_url: data.cover_url || null,
        links: data.links || [],
        lineup: data.lineup || [],
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

      // Sync organizers if organizer_ids is provided
      if (data.organizer_ids && data.organizer_ids.length > 0 && result) {
        await syncEventOrganizers(result.id, data.organizer_ids);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-event", data.id] });
      toast.success("Evento salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Event save error:", error);
      toast.error(error.message || "Erro ao salvar evento");
    },
  });
};

// Helper function to sync event organizers
async function syncEventOrganizers(agendaId: string, organizerIds: string[]) {
  try {
    // Remove existing organizers
    const { error: deleteError } = await supabase
      .from("agenda_item_organizers")
      .delete()
      .eq("agenda_id", agendaId);

    if (deleteError) {
      console.error("Error removing existing organizers:", deleteError);
      throw deleteError;
    }

    // Add new organizers
    if (organizerIds.length > 0) {
      const organizerData = organizerIds.map((organizerId, index) => ({
        agenda_id: agendaId,
        organizer_id: organizerId,
        role: index === 0 ? "organizer" : "co-organizer",
        main_organizer: index === 0,
        position: index,
      }));

      const { error: insertError } = await supabase
        .from("agenda_item_organizers")
        .insert(organizerData);

      if (insertError) {
        console.error("Error inserting organizers:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error syncing organizers:", error);
    toast.error("Erro ao sincronizar organizadores");
  }
}