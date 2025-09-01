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
      console.log("Upserting venue:", data);

      const { data: result, error } = await supabase
        .from("venues")
        .upsert(data, { 
          onConflict: "id",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Venue upsert error:", error);
        throw new Error(`Erro ao salvar local: ${error.message}`);
      }

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