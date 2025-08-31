import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AgendaCity {
  id: string;
  name: string;
  slug: string;
  uf?: string;
}

export const useAgendaCities = () => {
  return useQuery({
    queryKey: ["agenda-cities"],
    queryFn: async (): Promise<AgendaCity[]> => {
      const { data, error } = await supabase
        .from("agenda_cities")
        .select("id, name, slug, uf")
        .order("name");

      if (error) {
        console.error("Error fetching cities:", error);
        throw new Error(`Erro ao buscar cidades: ${error.message}`);
      }

      return data || [];
    },
  });
};