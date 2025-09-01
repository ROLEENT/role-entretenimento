import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Organizer {
  id: string;
  name: string;
  contact_email?: string;
  site?: string;
  instagram?: string;
}

export const useOrganizers = () => {
  return useQuery({
    queryKey: ["organizers"],
    queryFn: async (): Promise<Organizer[]> => {
      const { data, error } = await supabase
        .from("organizers")
        .select("id, name, contact_email, site, instagram")
        .order("name");

      if (error) {
        console.error("Error fetching organizers:", error);
        throw new Error(`Erro ao buscar organizadores: ${error.message}`);
      }

      return data || [];
    },
  });
};