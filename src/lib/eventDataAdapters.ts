/**
 * Event Data Adapters
 * 
 * Unified adapters to transform event data from different sources
 * (events table from admin-v3 and agenda_itens legacy table)
 * to consistent formats used across components.
 */

// Common event interface for transformed data
export interface UnifiedEvent {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  city?: string;
  date_start?: string;
  date_end?: string;
  image_url?: string;
  cover_url?: string;
  alt_text?: string;
  highlight_type?: 'vitrine' | 'curatorial' | 'none';
  status?: string;
  ticket_url?: string;
  slug?: string;
  genres?: string[];
  venue_name?: string;
  price_min?: number;
  price_max?: number;
  source: 'events' | 'agenda_itens'; // Track data source
}

/**
 * Transform event from 'events' table (admin-v3) to unified format
 */
export const transformEventTableData = (event: any): UnifiedEvent => ({
  id: event.id,
  title: event.title,
  subtitle: event.subtitle,
  summary: event.summary,
  city: event.city,
  date_start: event.date_start,
  date_end: event.date_end,
  image_url: event.image_url,
  cover_url: event.image_url,
  alt_text: event.cover_alt,
  highlight_type: normalizeHighlightType(event.highlight_type),
  status: event.status,
  ticket_url: event.ticket_url,
  slug: event.slug,
  genres: event.genres || [],
  venue_name: event.venue?.name || event.venues?.name,
  price_min: event.price_min,
  price_max: event.price_max,
  source: 'events'
});

/**
 * Transform event from 'agenda_itens' table (legacy) to unified format
 */
export const transformAgendaTableData = (item: any): UnifiedEvent => ({
  id: item.id,
  title: item.title,
  subtitle: item.subtitle,
  summary: item.summary,
  city: item.city,
  date_start: item.starts_at,
  date_end: item.end_at,
  image_url: item.cover_url,
  cover_url: item.cover_url,
  alt_text: item.alt_text,
  highlight_type: normalizeVisibilityType(item.visibility_type),
  status: item.status,
  ticket_url: item.ticket_url,
  slug: item.slug,
  genres: item.tags || [],
  venue_name: item.location_name,
  price_min: item.price_min,
  price_max: item.price_max,
  source: 'agenda_itens'
});

/**
 * Normalize highlight_type from events table
 */
function normalizeHighlightType(highlightType: any): 'vitrine' | 'curatorial' | 'none' {
  if (highlightType === 'vitrine') return 'vitrine';
  if (highlightType === 'curatorial') return 'curatorial';
  return 'none';
}

/**
 * Normalize visibility_type from agenda_itens table
 */
function normalizeVisibilityType(visibilityType: any): 'vitrine' | 'curatorial' | 'none' {
  if (visibilityType === 'vitrine') return 'vitrine';
  if (visibilityType === 'curadoria') return 'curatorial';
  return 'none';
}

/**
 * Transform unified event data for HorizontalCarousel component
 */
export const adaptEventForCarousel = (event: UnifiedEvent) => ({
  id: event.id,
  title: event.title,
  subtitle: event.subtitle,
  city: event.city,
  start_at: event.date_start,
  end_at: event.date_end,
  cover_url: event.cover_url || event.image_url,
  alt_text: event.alt_text,
  visibility_type: event.highlight_type,
  status: event.status,
  ticket_url: event.ticket_url,
  slug: event.slug,
  tags: event.genres,
  venue_name: event.venue_name
});

/**
 * Transform unified event data for EventCard component
 */
export const adaptEventForCard = (event: UnifiedEvent) => ({
  id: event.id,
  title: event.title,
  subtitle: event.subtitle,
  summary: event.summary,
  city: event.city,
  location_name: event.venue_name,
  date_start: event.date_start,
  date_end: event.date_end,
  doors_open_utc: event.date_start,
  image_url: event.image_url || event.cover_url,
  cover_url: event.cover_url || event.image_url,
  price_min: event.price_min,
  price_max: event.price_max,
  currency: 'BRL',
  highlight_type: event.highlight_type || 'none',
  is_sponsored: event.highlight_type === 'vitrine',
  age_rating: null,
  genres: event.genres || [],
  slug: event.slug,
  ticket_url: event.ticket_url,
  lineup: []
});

/**
 * Get event detail route based on source
 */
export const getEventRoute = (event: UnifiedEvent): string => {
  // Always use /evento/ route for unified events
  return `/evento/${event.slug || event.id}`;
};

/**
 * Fetch events with hybrid approach (events + agenda_itens fallback)
 */
export const createHybridEventFetcher = (supabase: any) => {
  return async (
    filters: {
      city?: string;
      search?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<UnifiedEvent[]> => {
    const {
      city,
      search,
      tags,
      dateRange,
      limit = 12,
      offset = 0
    } = filters;

    let allEvents: UnifiedEvent[] = [];

    // First, fetch from events table (priority)
    let eventsQuery = supabase
      .from('events')
      .select(`
        id, title, subtitle, summary, city, date_start, date_end, 
        image_url, cover_alt, highlight_type, status, ticket_url, 
        slug, genres, price_min, price_max,
        venue:venues(name)
      `)
      .eq('status', 'published');

    if (city) eventsQuery = eventsQuery.eq('city', city);
    if (search) eventsQuery = eventsQuery.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`);
    if (tags?.length) eventsQuery = eventsQuery.overlaps('genres', tags);
    if (dateRange) {
      eventsQuery = eventsQuery
        .gte('date_start', dateRange.start.toISOString())
        .lte('date_start', dateRange.end.toISOString());
    }

    const { data: eventsData } = await eventsQuery
      .order('date_start', { ascending: true })
      .range(offset, offset + limit - 1);

    if (eventsData) {
      allEvents = eventsData.map(transformEventTableData);
    }

    // If we need more events, fetch from agenda_itens
    if (allEvents.length < limit) {
      const remainingLimit = limit - allEvents.length;
      
      let agendaQuery = supabase
        .from('agenda_itens')
        .select(`
          id, title, subtitle, summary, city, starts_at, end_at,
          cover_url, alt_text, visibility_type, status, ticket_url,
          slug, tags, price_min, price_max, location_name
        `)
        .eq('status', 'published');

      if (city) agendaQuery = agendaQuery.eq('city', city);
      if (search) agendaQuery = agendaQuery.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`);
      if (tags?.length) agendaQuery = agendaQuery.overlaps('tags', tags);
      if (dateRange) {
        agendaQuery = agendaQuery
          .gte('starts_at', dateRange.start.toISOString())
          .lte('starts_at', dateRange.end.toISOString());
      }

      const { data: agendaData } = await agendaQuery
        .order('starts_at', { ascending: true })
        .limit(remainingLimit);

      if (agendaData) {
        const transformedAgendaEvents = agendaData.map(transformAgendaTableData);
        allEvents = [...allEvents, ...transformedAgendaEvents];
      }
    }

    return allEvents;
  };
};