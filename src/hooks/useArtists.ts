import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Artist {
  id: string;
  stage_name: string;
  name: string;
  artist_type?: string;
  city?: string;
  profile_image_url?: string;
}

export const useArtists = () => {
  return useQuery({
    queryKey: ["artists"],
    queryFn: async (): Promise<Artist[]> => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, stage_name, name, artist_type, city, profile_image_url")
        .eq("status", "active")
        .order("stage_name");

      if (error) {
        console.error("Error fetching artists:", error);
        throw new Error(`Erro ao buscar artistas: ${error.message}`);
      }

      return data || [];
    },
  });
};