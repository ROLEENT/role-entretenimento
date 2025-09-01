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

      // Transform data to match agenda_itens table structure
      const eventData = {
        // Basic info
        title: data.title,
        slug: data.slug,
        status: data.status === 'published' ? 'published' : 'draft',
        summary: data.excerpt || null,
        
        // Dates
        starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
        end_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
        
        // Location
        city: data.city_id, // For now, storing city_id as city text
        venue_id: data.venue_id || null,
        organizer_id: data.organizer_id || null,
        
        // Pricing
        price_min: data.price_min || null,
        price_max: data.price_max || null,
        
        // Content
        subtitle: data.content || null,
        age_rating: data.age_rating || null,
        
        // Media
        cover_url: data.cover_url || null,
        
        // New columns we added
        lineup_ids: data.lineup || [],
        external_links: data.links || [],
        gallery_urls: data.gallery || [],
        
        // SEO
        meta_title: data.seo_title || null,
        meta_description: data.seo_description || null,
        
        // If updating existing event, include ID
        ...(data.id && { id: data.id })
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
      queryClient.invalidateQueries({ queryKey: ["agenda-items"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-item", data.id] });
      queryClient.invalidateQueries({ queryKey: ["events"] }); // Legacy support
      toast.success("Evento salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Event save error:", error);
      toast.error(error.message || "Erro ao salvar evento");
    },
  });
};