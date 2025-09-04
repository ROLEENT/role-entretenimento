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
  // Novos campos para identificar origem dos dados
  source?: 'events' | 'agenda_itens';
  event_id?: string;
};

export function useProfileEvents(profileHandle: string, profileType: string) {
  return useQuery({
    queryKey: ['profile-events', profileHandle, profileType],
    queryFn: async () => {
      try {
        console.log(`Buscando eventos para ${profileType}: ${profileHandle}`);
        let eventsData: ProfileEvent[] = [];
        
        if (profileType === 'local') {
          // Para locais, buscar de forma robusta
          console.log(`Buscando venue para handle: ${profileHandle}`);
          
          // Primeiro, buscar o venue pelo slug
          const { data: venues, error: venueError } = await supabase
            .from('venues')
            .select('id, name, slug, city')
            .eq('slug', profileHandle)
            .limit(1);

          console.log('Venues encontrados:', venues);
          if (venueError) console.error('Erro ao buscar venue:', venueError);

          if (venues && venues.length > 0) {
            const venue = venues[0];
            console.log(`Venue encontrado: ${venue.name} (${venue.city})`);
            
            // Buscar eventos usando múltiplas estratégias
            try {
              // 1. Buscar na tabela events por venue_id
              const { data: eventsByVenue, error: error1 } = await supabase
                .from('events')
                .select('id, title, slug, subtitle, image_url, date_start, date_end, city, location_name, status, visibility')
                .eq('venue_id', venue.id)
                .eq('status', 'published')
                .gte('date_start', new Date().toISOString())
                .order('date_start', { ascending: true })
                .limit(20);

              // 2. Buscar na tabela events por location_name
              const { data: eventsByLocation, error: error2 } = await supabase
                .from('events')
                .select('id, title, slug, subtitle, image_url, date_start, date_end, city, location_name, status, visibility')
                .ilike('location_name', `%${venue.name}%`)
                .eq('status', 'published')
                .gte('date_start', new Date().toISOString())
                .order('date_start', { ascending: true })
                .limit(20);
              
              // 3. Buscar na agenda_itens
              const { data: eventsFromAgenda, error: error3 } = await supabase
                .from('agenda_itens')
                .select('id, title, slug, subtitle, cover_url, starts_at, end_at, city, location_name, status, type, tags')
                .ilike('location_name', `%${venue.name}%`)
                .eq('status', 'published')
                .is('deleted_at', null)
                .gte('starts_at', new Date().toISOString())
                .order('starts_at', { ascending: true })
                .limit(20);

              // Combinar todos os resultados
              let allEvents: any[] = [];
              
               // Adicionar eventos da tabela events (venue_id)
              if (eventsByVenue && !error1) {
                const mappedEvents = eventsByVenue.map((event: any) => ({
                  id: event.id,
                  title: event.title,
                  slug: event.slug,
                  subtitle: event.subtitle,
                  cover_url: event.image_url,
                  starts_at: event.date_start,
                  end_at: event.date_end,
                  city: event.city || venue.city,
                  location_name: venue.name, // Sempre usar o nome do venue
                  status: event.status,
                  type: event.visibility,
                  tags: [],
                  source: 'events' as const,
                  event_id: event.id
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos por venue_id`);
              }

              // Adicionar eventos da tabela events (location_name)
              if (eventsByLocation && !error2) {
                const mappedEvents = eventsByLocation.map((event: any) => ({
                  id: event.id,
                  title: event.title,
                  slug: event.slug,
                  subtitle: event.subtitle,
                  cover_url: event.image_url,
                  starts_at: event.date_start,
                  end_at: event.date_end,
                  city: event.city || venue.city,
                  location_name: venue.name, // Sempre usar o nome do venue
                  status: event.status,
                  type: event.visibility,
                  tags: [],
                  source: 'events' as const,
                  event_id: event.id
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos por location_name`);
              }

              // Adicionar eventos da agenda_itens
              if (eventsFromAgenda && !error3) {
                const mappedEvents = eventsFromAgenda.map((event: any) => ({
                  id: event.id,
                  title: event.title,
                  slug: event.slug,
                  subtitle: event.subtitle,
                  cover_url: event.cover_url,
                  starts_at: event.starts_at,
                  end_at: event.end_at,
                  city: event.city || venue.city,
                  location_name: venue.name, // Sempre usar o nome do venue
                  status: event.status,
                  type: event.type,
                  tags: event.tags || [],
                  source: 'agenda_itens' as const
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos da agenda_itens`);
              }

              // Remover duplicatas baseado no slug
              const uniqueEvents = allEvents.reduce((acc: any[], event: any) => {
                if (!acc.some(e => e.slug === event.slug)) {
                  acc.push(event);
                }
                return acc;
              }, []);

              // Ordenar por data
              eventsData = uniqueEvents.sort((a, b) => 
                new Date(a.starts_at || '').getTime() - new Date(b.starts_at || '').getTime()
              );

              console.log(`Total de eventos únicos para ${venue.name}: ${eventsData.length}`);
              
            } catch (queryError) {
              console.error('Erro ao buscar eventos:', queryError);
            }
          } else {
            console.log('Nenhum venue encontrado, tentando fallback...');
            
            // Fallback: buscar diretamente na agenda_itens
            const { data: fallbackEvents, error: fallbackError } = await supabase
              .from('agenda_itens')
              .select('id, title, slug, subtitle, cover_url, starts_at, end_at, city, location_name, status, type, tags')
              .or(`location_name.ilike.%${profileHandle}%,title.ilike.%${profileHandle}%`)
              .eq('status', 'published')
              .is('deleted_at', null)
              .gte('starts_at', new Date().toISOString())
              .order('starts_at', { ascending: true })
              .limit(20);
            
            if (!fallbackError && fallbackEvents) {
              eventsData = fallbackEvents.map((event: any) => ({
                ...event,
                cover_url: event.cover_url,
                starts_at: event.starts_at,
                end_at: event.end_at,
                source: 'agenda_itens' as const
              }));
              console.log(`Fallback encontrou ${eventsData.length} eventos`);
            }
          }
        } else if (profileType === 'artista') {
          // Para artistas, buscar em ambas as tabelas: events e agenda_itens
          console.log(`Buscando eventos para artista: ${profileHandle}`);
          
          try {
            let allEvents: any[] = [];
            
            // 1. Buscar na tabela events por título que contenha o nome do artista
            // Primeiro, buscar o perfil para obter o nome do artista
            const { data: profileData } = await supabase
              .from('entity_profiles')
              .select('name, source_id')
              .eq('handle', profileHandle)
              .eq('type', 'artista')
              .maybeSingle();
              
            const artistName = profileData?.name || profileHandle;
            
            const { data: eventsFromEventsTable, error: eventsError } = await supabase
              .from('events')
              .select('id, title, slug, subtitle, image_url, date_start, date_end, city, location_name, status, visibility, genres')
              .or(`title.ilike.%${artistName}%,title.ilike.%${profileHandle}%`)
              .eq('status', 'published')
              .gte('date_start', new Date().toISOString())
              .order('date_start', { ascending: true })
              .limit(20);

            if (eventsFromEventsTable && !eventsError) {
              const mappedEvents = eventsFromEventsTable.map((event: any) => ({
                id: event.id,
                title: event.title,
                slug: event.slug,
                subtitle: event.subtitle,
                cover_url: event.image_url,
                starts_at: event.date_start,
                end_at: event.date_end,
                city: event.city,
                location_name: event.location_name,
                status: event.status,
                type: event.visibility,
                tags: event.genres || [],
                source: 'events' as const,
                event_id: event.id
              }));
              allEvents = [...allEvents, ...mappedEvents];
              console.log(`Encontrados ${mappedEvents.length} eventos na tabela events por título`);
            }

            // 2. Buscar na tabela events por gêneros que coincidam com as tags do artista
            const { data: eventsByGenres, error: genresError } = await supabase
              .from('events')
              .select('id, title, slug, subtitle, image_url, date_start, date_end, city, location_name, status, visibility, genres')
              .contains('genres', ['post punk'])  // Buscar por gêneros específicos do artista
              .eq('status', 'published')
              .gte('date_start', new Date().toISOString())
              .order('date_start', { ascending: true })
              .limit(20);

            if (eventsByGenres && !genresError) {
              const mappedEvents = eventsByGenres.map((event: any) => ({
                id: event.id,
                title: event.title,
                slug: event.slug,
                subtitle: event.subtitle,
                cover_url: event.image_url,
                starts_at: event.date_start,
                end_at: event.date_end,
                city: event.city,
                location_name: event.location_name,
                status: event.status,
                type: event.visibility,
                tags: event.genres || [],
                source: 'events' as const,
                event_id: event.id
              }));
              allEvents = [...allEvents, ...mappedEvents];
              console.log(`Encontrados ${mappedEvents.length} eventos na tabela events por gêneros`);
            }

            // 3. Buscar na agenda_itens por nome do artista
            const { data: agendaEvents, error: agendaError } = await supabase
              .from('agenda_itens')
              .select(`
                id, title, slug, subtitle, cover_url, starts_at, end_at,
                city, location_name, status, type, tags, artists_names
              `)
              .or(`title.ilike.%${profileHandle}%,artists_names.cs.{${profileHandle}}`)
              .eq('status', 'published')
              .is('deleted_at', null)
              .gte('starts_at', new Date().toISOString())
              .order('starts_at', { ascending: true })
              .limit(20);

            if (agendaEvents && !agendaError) {
              const mappedEvents = agendaEvents.map((event: any) => ({
                ...event,
                source: 'agenda_itens' as const
              }));
              allEvents = [...allEvents, ...mappedEvents];
              console.log(`Encontrados ${mappedEvents.length} eventos na agenda_itens`);
            }

            // Remover duplicatas baseado no slug
            const uniqueEvents = allEvents.reduce((acc: any[], event: any) => {
              if (!acc.some(e => e.slug === event.slug)) {
                acc.push(event);
              }
              return acc;
            }, []);

            // Ordenar por data
            eventsData = uniqueEvents.sort((a, b) => 
              new Date(a.starts_at || '').getTime() - new Date(b.starts_at || '').getTime()
            );

            console.log(`Total de eventos únicos para artista ${profileHandle}: ${eventsData.length}`);
            
          } catch (queryError) {
            console.error('Erro ao buscar eventos para artista:', queryError);
          }
        } else {
          // Para organizadores
          let query = supabase
            .from('agenda_itens')
            .select(`
              id, title, slug, subtitle, cover_url, starts_at, end_at,
              city, location_name, status, type, tags, artists_names
            `)
            .eq('status', 'published')
            .is('deleted_at', null);

          if (profileType === 'organizador') {
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
            eventsData = (data || []).map((event: any) => ({
              ...event,
              source: 'agenda_itens' as const
            })) as ProfileEvent[];
          }
        }

        console.log(`Eventos finais para ${profileType} "${profileHandle}":`, eventsData);
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