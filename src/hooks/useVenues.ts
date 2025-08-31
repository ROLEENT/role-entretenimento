import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Venue {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

export const useVenues = () => {
  return useQuery({
    queryKey: ["venues"],
    queryFn: async (): Promise<Venue[]> => {
      const { data, error } = await supabase
        .from("venues")
        .select("id, name, address, city")
        .order("name");

      if (error) {
        console.error("Error fetching venues:", error);
        throw new Error(`Erro ao buscar locais: ${error.message}`);
      }

      return data || [];
    },
  });
};