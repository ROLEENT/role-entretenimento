import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AgendaEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  city: string;
  cover_url?: string;
  cover_path?: string;
  cover?: any;
  cover_alt?: string;
}

/**
 * Hook to fetch events specifically from agenda_itens table
 */
export function useAgendaEvents() {
  return useQuery({
    queryKey: ["agenda-events"],
    queryFn: async () => {
      console.log("🎯 Buscando eventos da agenda_itens...");
      
      // Calculate 12 hours ago
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      const { data, error } = await supabase
        .from('agenda_itens')
        .select(`
          id,
          title, 
          slug,
          starts_at,
          city,
          cover_url,
          cover_path,
          cover,
          cover_alt
        `)
        .eq('status', 'published')
        .gte('starts_at', twelveHoursAgo.toISOString())
        .order('starts_at', { ascending: true })
        .limit(12);

      if (error) {
        console.error("❌ Erro ao buscar eventos da agenda:", error);
        throw error;
      }

      console.log("✅ Eventos da agenda encontrados:", data?.length || 0);
      
      return (data as AgendaEvent[]) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Utility function to resolve cover image URL
 */
export function resolveCoverImageUrl(event: AgendaEvent): string {
  // If cover_url is a full HTTP URL, use it directly
  if (event.cover_url && (event.cover_url.startsWith('http://') || event.cover_url.startsWith('https://'))) {
    return event.cover_url;
  }

  // If we have cover_path or cover with storage path, generate public URL
  const storagePath = event.cover_path || (typeof event.cover === 'string' ? event.cover : null);
  if (storagePath) {
    const { data } = supabase.storage.from('agenda-covers').getPublicUrl(storagePath);
    return data.publicUrl;
  }

  // If cover is an object with url property
  if (event.cover && typeof event.cover === 'object' && event.cover.url) {
    return event.cover.url;
  }

  // Fallback to placeholder
  return '/img/placeholder-event-16x9.jpg';
}