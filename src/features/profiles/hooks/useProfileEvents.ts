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
              const { data: eventsFromEventsTable, error: eventsError } = await supabase
                .from('events')
                .select('id, title, slug, subtitle, image_url, date_start, date_end, city, location_name, status, visibility, genres')
                .eq('venue_id', venue.id)
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
                eventsData = [...eventsData, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos na tabela events`);
              }

              // 2. Buscar na agenda_itens por venue_id
              const { data: agendaEvents, error: agendaError } = await supabase
                .from('agenda_itens')
                .select(`
                  id, title, slug, subtitle, cover_url, starts_at, end_at,
                  city, location_name, status, type, tags
                `)
                .eq('venue_id', venue.id)
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
                eventsData = [...eventsData, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos na agenda_itens`);
              }

              // 3. Se não encontrou eventos por venue_id, buscar por nome do local
              if (eventsData.length === 0) {
                const { data: eventsByLocationName, error: locationError } = await supabase
                  .from('agenda_itens')
                  .select(`
                    id, title, slug, subtitle, cover_url, starts_at, end_at,
                    city, location_name, status, type, tags
                  `)
                  .ilike('location_name', `%${venue.name}%`)
                  .eq('status', 'published')
                  .is('deleted_at', null)
                  .gte('starts_at', new Date().toISOString())
                  .order('starts_at', { ascending: true })
                  .limit(20);

                if (eventsByLocationName && !locationError) {
                  const mappedEvents = eventsByLocationName.map((event: any) => ({
                    ...event,
                    source: 'agenda_itens' as const
                  }));
                  eventsData = mappedEvents;
                  console.log(`Encontrados ${mappedEvents.length} eventos por nome do local`);
                }
              }

              // 4. Se ainda não tem eventos, buscar na mesma cidade
              if (eventsData.length === 0 && venue.city) {
                const { data: eventsByCity, error: cityError } = await supabase
                  .from('agenda_itens')
                  .select(`
                    id, title, slug, subtitle, cover_url, starts_at, end_at,
                    city, location_name, status, type, tags
                  `)
                  .eq('city', venue.city)
                  .eq('status', 'published')
                  .is('deleted_at', null)
                  .gte('starts_at', new Date().toISOString())
                  .order('starts_at', { ascending: true })
                  .limit(10);

                if (eventsByCity && !cityError) {
                  const mappedEvents = eventsByCity.map((event: any) => ({
                    ...event,
                    source: 'agenda_itens' as const
                  }));
                  eventsData = mappedEvents;
                  console.log(`Encontrados ${mappedEvents.length} eventos na mesma cidade`);
                }
              }

              // Remover duplicatas e ordenar
              const uniqueEvents = eventsData.reduce((acc: ProfileEvent[], event: ProfileEvent) => {
                if (!acc.some(e => e.slug === event.slug)) {
                  acc.push(event);
                }
                return acc;
              }, []);

              eventsData = uniqueEvents.sort((a, b) => 
                new Date(a.starts_at || '').getTime() - new Date(b.starts_at || '').getTime()
              );

              console.log(`Total de eventos únicos para venue ${profileHandle}: ${eventsData.length}`);
            } catch (error) {
              console.error('Erro ao buscar eventos para venue:', error);
            }
          } else {
            console.log(`Venue não encontrado para handle: ${profileHandle}`);
          }
        } else if (profileType === 'artista') {
          // Para artistas, buscar APENAS onde eles estão realmente no lineup
          console.log(`Buscando eventos para artista: ${profileHandle}`);
          
          try {
            let allEvents: any[] = [];
            
            // 1. Buscar o perfil para obter o nome e source_id do artista
            const { data: profileData } = await supabase
              .from('entity_profiles')
              .select('name, source_id')
              .eq('handle', profileHandle)
              .eq('type', 'artista')
              .maybeSingle();
              
            if (!profileData) {
              console.log(`Perfil não encontrado para artista: ${profileHandle}`);
              return [];
            }
            
            const artistName = profileData.name;
            const artistId = profileData.source_id;
            
            // 2. Buscar na tabela agenda_item_artists (eventos onde o artista está no lineup)
            if (artistId) {
              const { data: agendaArtistEvents, error: agendaArtistError } = await supabase
                .from('agenda_item_artists')
                .select(`
                  agenda_id,
                  agenda_itens!inner (
                    id, title, slug, subtitle, cover_url, starts_at, end_at,
                    city, location_name, status, type, tags
                  )
                `)
                .eq('artist_id', artistId)
                .eq('agenda_itens.status', 'published')
                .is('agenda_itens.deleted_at', null)
                .gte('agenda_itens.starts_at', new Date().toISOString())
                .order('agenda_itens.starts_at', { ascending: true });

              if (agendaArtistEvents && !agendaArtistError) {
                const mappedEvents = agendaArtistEvents.map((item: any) => ({
                  ...item.agenda_itens,
                  source: 'agenda_itens' as const
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos via agenda_item_artists`);
              }
            }

            // 3. Buscar na tabela event_lineup_slot_artists (nova estrutura de eventos)
            if (artistId) {
              const { data: eventLineupArtists, error: eventLineupError } = await supabase
                .from('event_lineup_slot_artists')
                .select(`
                  artist_id,
                  slot_id,
                  event_lineup_slots!inner (
                    event_id,
                    events!inner (
                      id, title, slug, subtitle, image_url, date_start, date_end,
                      city, location_name, status, visibility, genres
                    )
                  )
                `)
                .eq('artist_id', artistId);

              if (eventLineupArtists && !eventLineupError) {
                // Filtrar apenas eventos publicados e futuros
                const filteredEvents = eventLineupArtists.filter((item: any) => {
                  const event = item.event_lineup_slots?.events;
                  if (!event) return false;
                  return event.status === 'published' && 
                         new Date(event.date_start) >= new Date();
                });
                
                const mappedEvents = filteredEvents.map((item: any) => ({
                  id: item.event_lineup_slots.events.id,
                  title: item.event_lineup_slots.events.title,
                  slug: item.event_lineup_slots.events.slug,
                  subtitle: item.event_lineup_slots.events.subtitle,
                  cover_url: item.event_lineup_slots.events.image_url,
                  starts_at: item.event_lineup_slots.events.date_start,
                  end_at: item.event_lineup_slots.events.date_end,
                  city: item.event_lineup_slots.events.city,
                  location_name: item.event_lineup_slots.events.location_name,
                  status: item.event_lineup_slots.events.status,
                  type: item.event_lineup_slots.events.visibility,
                  tags: item.event_lineup_slots.events.genres || [],
                  source: 'events' as const,
                  event_id: item.event_lineup_slots.events.id
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos via event_lineup_slot_artists`);
                console.log('Dados dos eventos encontrados:', mappedEvents);
              } else if (eventLineupError) {
                console.error('Erro ao buscar eventos via event_lineup_slot_artists:', eventLineupError);
              }
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
        } else if (profileType === 'organizador') {
          // Para organizadores, buscar em ambas as tabelas: events e agenda_itens
          console.log(`Buscando eventos para organizador: ${profileHandle}`);
          
          try {
            let allEvents: any[] = [];
            
            // 1. Buscar o organizador pelo slug para obter o ID
            const { data: organizerData } = await supabase
              .from('organizers')
              .select('id, name')
              .eq('slug', profileHandle)
              .maybeSingle();

            if (organizerData) {
              // 2. Buscar na tabela events por organizadores relacionados
              const { data: eventsFromEventsTable, error: eventsError } = await supabase
                .from('event_partners')
                .select(`
                  event_id,
                  events!inner (
                    id, title, slug, subtitle, image_url, date_start, date_end,
                    city, location_name, status, visibility, genres
                  )
                `)
                .eq('partner_id', organizerData.id)
                .eq('partner_type', 'organizer')
                .eq('events.status', 'published')
                .gte('events.date_start', new Date().toISOString())
                .order('events.date_start', { ascending: true });

              if (eventsFromEventsTable && !eventsError) {
                const mappedEvents = eventsFromEventsTable.map((item: any) => ({
                  id: item.events.id,
                  title: item.events.title,
                  slug: item.events.slug,
                  subtitle: item.events.subtitle,
                  cover_url: item.events.image_url,
                  starts_at: item.events.date_start,
                  end_at: item.events.date_end,
                  city: item.events.city,
                  location_name: item.events.location_name,
                  status: item.events.status,
                  type: item.events.visibility,
                  tags: item.events.genres || [],
                  source: 'events' as const,
                  event_id: item.events.id
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos na tabela events`);
              }

              // 3. Buscar na agenda_itens por organizer_id
              const { data: agendaEvents, error: agendaError } = await supabase
                .from('agenda_itens')
                .select(`
                  id, title, slug, subtitle, cover_url, starts_at, end_at,
                  city, location_name, status, type, tags
                `)
                .eq('organizer_id', organizerData.id)
                .eq('status', 'published')
                .is('deleted_at', null)
                .gte('starts_at', new Date().toISOString())
                .order('starts_at', { ascending: true });

              if (agendaEvents && !agendaError) {
                const mappedEvents = agendaEvents.map((event: any) => ({
                  ...event,
                  source: 'agenda_itens' as const
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos na agenda_itens`);
              }

              // 4. Buscar na agenda_item_organizers
              const { data: agendaOrganizerEvents, error: agendaOrganizerError } = await supabase
                .from('agenda_item_organizers')
                .select(`
                  agenda_id,
                  agenda_itens!inner (
                    id, title, slug, subtitle, cover_url, starts_at, end_at,
                    city, location_name, status, type, tags
                  )
                `)
                .eq('organizer_id', organizerData.id)
                .eq('agenda_itens.status', 'published')
                .is('agenda_itens.deleted_at', null)
                .gte('agenda_itens.starts_at', new Date().toISOString())
                .order('agenda_itens.starts_at', { ascending: true });

              if (agendaOrganizerEvents && !agendaOrganizerError) {
                const mappedEvents = agendaOrganizerEvents.map((item: any) => ({
                  ...item.agenda_itens,
                  source: 'agenda_itens' as const
                }));
                allEvents = [...allEvents, ...mappedEvents];
                console.log(`Encontrados ${mappedEvents.length} eventos via agenda_item_organizers`);
              }
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

            console.log(`Total de eventos únicos para organizador ${profileHandle}: ${eventsData.length}`);
          } catch (queryError) {
            console.error('Erro ao buscar eventos para organizador:', queryError);
          }
        }

        console.log(`Retornando ${eventsData.length} eventos para ${profileType}: ${profileHandle}`);
        return eventsData;
      } catch (error) {
        console.error('Erro geral ao buscar eventos:', error);
        return [];
      }
    },
    enabled: !!profileHandle && !!profileType,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000 // 30 minutos
  });
}

// Hook for simplified past events (archived events)
export function useProfilePastEvents(profileHandle: string, profileType: string) {
  return useQuery({
    queryKey: ['profile-past-events', profileHandle, profileType],
    queryFn: async () => {
      try {
        console.log(`Buscando eventos passados para ${profileType}: ${profileHandle}`);
        let eventsData: ProfileEvent[] = [];
        
        if (profileType === 'local') {
          // Para locais, buscar venue primeiro
          const { data: venues } = await supabase
            .from('venues')
            .select('id, name, slug, city')
            .eq('slug', profileHandle)
            .limit(1);

          if (venues && venues.length > 0) {
            const venue = venues[0];
            
            // Buscar eventos passados na agenda_itens por venue_id
            const { data: agendaEvents } = await supabase
              .from('agenda_itens')
              .select(`
                id, title, slug, subtitle, cover_url, starts_at, end_at,
                city, location_name, status, type, tags
              `)
              .eq('venue_id', venue.id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .lt('starts_at', new Date().toISOString())
              .order('starts_at', { ascending: false })
              .limit(20);

            if (agendaEvents) {
              eventsData = agendaEvents.map((event: any) => ({
                ...event,
                source: 'agenda_itens' as const
              }));
            }
          }
        } else if (profileType === 'artista') {
          // Para artistas, buscar apenas onde estão no lineup
          const { data: profileData } = await supabase
            .from('entity_profiles')
            .select('name, source_id')
            .eq('handle', profileHandle)
            .eq('type', 'artista')
            .maybeSingle();
            
          if (profileData?.source_id) {
            const { data: agendaArtistEvents } = await supabase
              .from('agenda_item_artists')
              .select(`
                agenda_id,
                agenda_itens!inner (
                  id, title, slug, subtitle, cover_url, starts_at, end_at,
                  city, location_name, status, type, tags
                )
              `)
              .eq('artist_id', profileData.source_id)
              .eq('agenda_itens.status', 'published')
              .is('agenda_itens.deleted_at', null)
              .lt('agenda_itens.starts_at', new Date().toISOString())
              .order('agenda_itens.starts_at', { ascending: false });

            if (agendaArtistEvents) {
              eventsData = agendaArtistEvents.map((item: any) => ({
                ...item.agenda_itens,
                source: 'agenda_itens' as const
              }));
            }
          }
        } else if (profileType === 'organizador') {
          // Para organizadores
          const { data: organizerData } = await supabase
            .from('organizers')
            .select('id')
            .eq('slug', profileHandle)
            .maybeSingle();

          if (organizerData) {
            const { data: agendaEvents } = await supabase
              .from('agenda_itens')
              .select(`
                id, title, slug, subtitle, cover_url, starts_at, end_at,
                city, location_name, status, type, tags
              `)
              .eq('organizer_id', organizerData.id)
              .eq('status', 'published')
              .is('deleted_at', null)
              .lt('starts_at', new Date().toISOString())
              .order('starts_at', { ascending: false })
              .limit(20);

            if (agendaEvents) {
              eventsData = agendaEvents.map((event: any) => ({
                ...event,
                source: 'agenda_itens' as const
              }));
            }
          }
        }

        return eventsData;
      } catch (error) {
        console.error('Erro ao buscar eventos passados:', error);
        return [];
      }
    },
    enabled: !!profileHandle && !!profileType,
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 60 * 60 * 1000 // 60 minutos
  });
}