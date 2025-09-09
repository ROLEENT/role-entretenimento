import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EventOrganizerData {
  id: string;
  agenda_id: string;
  organizer_id: string;
  role: string;
  position: number;
  main_organizer: boolean;
  created_at: string;
  organizers?: {
    id: string;
    name: string;
    site?: string;
    instagram?: string;
  };
}

export interface AddEventOrganizerData {
  agenda_id: string;
  organizer_id: string;
  role?: string;
  main_organizer?: boolean;
  position?: number;
}

export const useEventOrganizers = (eventId?: string) => {
  const queryClient = useQueryClient();

  // Fetch organizers for an event
  const {
    data: organizers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event-organizers", eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from("agenda_item_organizers")
        .select(`
          *,
          organizers:organizer_id (
            id,
            name,
            site,
            instagram
          )
        `)
        .eq("agenda_id", eventId)
        .order("position");

      if (error) {
        console.error("Error fetching event organizers:", error);
        throw error;
      }

      return data as EventOrganizerData[];
    },
    enabled: !!eventId,
  });

  // Add organizer to event
  const addOrganizerMutation = useMutation({
    mutationFn: async (data: AddEventOrganizerData) => {
      // If this is the main organizer, unset other main organizers
      if (data.main_organizer) {
        await supabase
          .from("agenda_item_organizers")
          .update({ main_organizer: false })
          .eq("agenda_id", data.agenda_id);
      }

      const { data: result, error } = await supabase
        .from("agenda_item_organizers")
        .insert({
          agenda_id: data.agenda_id,
          organizer_id: data.organizer_id,
          role: data.role || "organizer",
          main_organizer: data.main_organizer || false,
          position: data.position ?? organizers.length,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding organizer:", error);
        throw new Error(`Erro ao adicionar organizador: ${error.message}`);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-organizers", eventId] });
      toast.success("Organizador adicionado com sucesso!");
    },
    onError: (error) => {
      console.error("Error adding organizer:", error);
      toast.error(error.message || "Erro ao adicionar organizador");
    },
  });

  // Remove organizer from event
  const removeOrganizerMutation = useMutation({
    mutationFn: async (organizerId: string) => {
      const { error } = await supabase
        .from("agenda_item_organizers")
        .delete()
        .eq("id", organizerId);

      if (error) {
        console.error("Error removing organizer:", error);
        throw new Error(`Erro ao remover organizador: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-organizers", eventId] });
      toast.success("Organizador removido com sucesso!");
    },
    onError: (error) => {
      console.error("Error removing organizer:", error);
      toast.error(error.message || "Erro ao remover organizador");
    },
  });

  // Update organizer position/role
  const updateOrganizerMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        role: string;
        position: number;
        main_organizer: boolean;
      }>;
    }) => {
      // If setting as main organizer, unset others first
      if (updates.main_organizer) {
        await supabase
          .from("agenda_item_organizers")
          .update({ main_organizer: false })
          .eq("agenda_id", eventId)
          .neq("id", id);
      }

      const { error } = await supabase
        .from("agenda_item_organizers")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Error updating organizer:", error);
        throw new Error(`Erro ao atualizar organizador: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-organizers", eventId] });
      toast.success("Organizador atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating organizer:", error);
      toast.error(error.message || "Erro ao atualizar organizador");
    },
  });

  // Reorder organizers
  const reorderOrganizersMutation = useMutation({
    mutationFn: async (reorderedOrganizers: { id: string; position: number }[]) => {
      const promises = reorderedOrganizers.map(({ id, position }) =>
        supabase
          .from("agenda_item_organizers")
          .update({ position })
          .eq("id", id)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((result) => result.error);

      if (errors.length > 0) {
        console.error("Error reordering organizers:", errors);
        throw new Error("Erro ao reordenar organizadores");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-organizers", eventId] });
      toast.success("Organizadores reordenados com sucesso!");
    },
    onError: (error) => {
      console.error("Error reordering organizers:", error);
      toast.error(error.message || "Erro ao reordenar organizadores");
    },
  });

  return {
    organizers,
    isLoading,
    error,
    addOrganizer: addOrganizerMutation.mutate,
    removeOrganizer: removeOrganizerMutation.mutate,
    updateOrganizer: updateOrganizerMutation.mutate,
    reorderOrganizers: reorderOrganizersMutation.mutate,
    isAddingOrganizer: addOrganizerMutation.isPending,
    isRemovingOrganizer: removeOrganizerMutation.isPending,
    isUpdatingOrganizer: updateOrganizerMutation.isPending,
    isReorderingOrganizers: reorderOrganizersMutation.isPending,
  };
};