import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEventsByCity(cityName: string) {
  return useQuery({
    queryKey: ["events-by-city", cityName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          venue:venues(id, name, address, city),
          organizer:organizers(id, name)
        `)
        .eq("status", "published")
        .ilike("city", `%${cityName}%`)
        .order("date_start", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!cityName,
  });
}