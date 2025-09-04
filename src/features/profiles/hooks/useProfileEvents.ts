import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProfileEvent = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  cover_url?: string;
  starts_at?: string;
  end_at?: string;
  city?: string;
  location_name?: string;
  status: string;
  type?: string;
  tags?: string[];
};

export function useProfileEvents(profileHandle: string, profileType: string) {
  return useQuery({
    queryKey: ['profile-events', profileHandle, profileType],
    queryFn: async () => {
      try {
        // Primeiro, tentar buscar na tabela events (mais atual)
        let eventsData: ProfileEvent[] = [];
        
        if (profileType === 'local') {
          // Para locais, buscar por venue_id e location_name
          // Primeiro, buscar o venue pelo slug/handle
          const { data: venues } = await supabase
            .from('venues')
            .select('id, name, slug')
            .or(`slug.eq.${profileHandle},name.ilike.%${profileHandle}%`)
            .limit(1);

          let venueQuery = supabase
            .from('events')
            .select(`
              id, title, slug, subtitle, image_url, date_start, date_end, city, location_name, status, visibility,
              venue:venues(id, name, city)
            `)
            .eq('status', 'published');

          if (venues && venues.length > 0) {
            // Buscar eventos pelo venue_id OU location_name
            venueQuery = venueQuery.or(`venue_id.eq.${venues[0].id},location_name.ilike.%${profileHandle}%`);
          } else {
            // Fallback: buscar apenas por location_name
            venueQuery = venueQuery.ilike('location_name', `%${profileHandle}%`);
          }

          const { data: eventsResult, error: eventsError } = await venueQuery
            .gte('date_start', new Date().toISOString())
            .order('date_start', { ascending: true })
            .limit(20);

          if (eventsError) {
            console.error('Error fetching events:', eventsError);
          } else {
            // Mapear dados da tabela events para o formato ProfileEvent
            eventsData = (eventsResult || []).map((event: any) => ({
              id: event.id,
              title: event.title,
              slug: event.slug,
              subtitle: event.subtitle,
              cover_url: event.image_url,
              starts_at: event.date_start,
              end_at: event.date_end,
              city: event.city || (event.venue && event.venue[0]?.city) || 'Cidade a definir',
              location_name: event.location_name || (event.venue && event.venue[0]?.name) || 'Local a definir',
              status: event.status,
              type: event.visibility,
              tags: []
            }));
          }
        } else {
          // Para outros tipos, manter busca na agenda_itens se necessário
          let query = supabase
            .from('agenda_itens')
            .select(`
              id, title, slug, subtitle, cover_url, starts_at, end_at,
              city, location_name, status, type, tags, artists_names
            `)
            .eq('status', 'published')
            .is('deleted_at', null);

          if (profileType === 'artista') {
            // Para artistas, buscar eventos onde eles participam
            query = query.or(`artists_names.cs.{${profileHandle}},title.ilike.%${profileHandle}%`);
          } else if (profileType === 'organizador') {
            // Para organizadores, buscar eventos que eles organizam
            query = query.ilike('title', `%${profileHandle}%`);
          }

          const { data, error } = await query
            .order('starts_at', { ascending: true })
            .gte('starts_at', new Date().toISOString())
            .limit(20);
          
          if (error) {
            console.error('Error fetching profile events:', error);
          } else {
            eventsData = (data || []) as ProfileEvent[];
          }
        }

        console.log(`Profile events for ${profileType} "${profileHandle}":`, eventsData);
        return eventsData;
      } catch (error) {
        console.error('Error in useProfileEvents:', error);
        return [];
      }
    },
    enabled: !!profileHandle && !!profileType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}