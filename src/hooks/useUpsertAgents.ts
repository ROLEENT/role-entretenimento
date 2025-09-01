"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VenueFormData } from "@/schemas/venue";
import { ArtistForm, OrganizerForm } from "@/schemas/agents";
import { toast } from "sonner";

export const useUpsertArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ArtistForm) => {
      console.log("Upserting artist:", data);

      const { data: result, error } = await supabase
        .from("artists")
        .upsert(data, { 
          onConflict: "id",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Artist upsert error:", error);
        throw new Error(`Erro ao salvar artista: ${error.message}`);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", data.id] });
      toast.success("Artista salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Artist save error:", error);
      toast.error(error.message || "Erro ao salvar artista");
    },
  });
};

export const useUpsertVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VenueFormData) => {
      console.log("Upserting venue - raw data:", data);

      // Transform and clean data like in useUpsertPost
      const venueData = {
        name: data.name,
        slug: data.slug || null,
        address_line: data.address_line || null,
        district: data.district || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        country: data.country || 'BR',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        capacity: data.capacity || null,
        opening_hours: data.opening_hours || {},
        caracteristicas_estabelecimento: data.caracteristicas_estabelecimento || {},
        estruturas: data.estruturas || {},
        diferenciais: data.diferenciais || {},
        bebidas: data.bebidas || {},
        cozinha: data.cozinha || {},
        seguranca: data.seguranca || {},
        acessibilidade: data.acessibilidade || {},
        banheiros: data.banheiros || {},
        instagram: data.instagram || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        about: data.about || null,
        tags: data.tags || [],
        cover_url: data.cover_url || null,
        cover_alt: data.cover_alt || null,
        gallery_urls: data.gallery_urls || [],
        status: data.status || 'active',
        priority: data.priority || 0,
        updated_at: new Date().toISOString(),
      };

      console.log("Upserting venue - transformed data:", venueData);

      let result;
      if (data.id) {
        // Update existing venue
        const { data: updateResult, error } = await supabase
          .from("venues")
          .update(venueData)
          .eq("id", data.id)
          .select("*")
          .single();
        
        if (error) throw error;
        result = updateResult;
      } else {
        // Create new venue
        const { data: insertResult, error } = await supabase
          .from("venues")
          .insert(venueData)
          .select("*")
          .single();
        
        if (error) throw error;
        result = insertResult;
      }

      console.log("Venue upsert successful:", result);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", data.id] });
      toast.success("Local salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Venue save error:", error);
      toast.error(error.message || "Erro ao salvar local");
    },
  });
};

export const useUpsertOrganizer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrganizerForm) => {
      console.log("Upserting organizer:", data);

      const { data: result, error } = await supabase
        .from("organizers")
        .upsert(data, { 
          onConflict: "id",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Organizer upsert error:", error);
        throw new Error(`Erro ao salvar organizador: ${error.message}`);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
      queryClient.invalidateQueries({ queryKey: ["organizer", data.id] });
      toast.success("Organizador salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Organizer save error:", error);
      toast.error(error.message || "Erro ao salvar organizador");
    },
  });
};