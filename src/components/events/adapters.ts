import { EventCardV3 } from "@/components/events/EventCardV3";
import { EventGrid } from "@/components/events/EventGrid";

// Event adapters to convert different data sources to EventCardV3 format
export const adaptAgendaItemToEvent = (item: any) => ({
  id: item.id,
  title: item.title,
  subtitle: item.subtitle,
  summary: item.summary,
  city: item.city,
  location_name: item.location_name,
  date_start: item.starts_at,
  date_end: item.end_at,
  doors_open_utc: item.doors_open_utc,
  image_url: item.cover_url,
  price_min: item.price_min,
  price_max: item.price_max,
  currency: item.currency || 'BRL',
  highlight_type: item.highlight_type || 'none',
  is_sponsored: item.is_sponsored || false,
  age_rating: item.age_rating,
  genres: item.tags || [],
  slug: item.slug,
  ticket_url: item.ticket_url,
  lineup: [] // Legacy data doesn't have structured lineup
});

export const adaptEventToCard = (event: any) => ({
  id: event.id,
  title: event.title,
  subtitle: event.subtitle,
  summary: event.summary,
  city: event.city,
  location_name: event.location_name,
  date_start: event.date_start,
  date_end: event.date_end,
  doors_open_utc: event.doors_open_utc,
  image_url: event.image_url || event.cover_url,
  cover_url: event.cover_url,
  price_min: event.price_min,
  price_max: event.price_max,
  currency: event.currency || 'BRL',
  highlight_type: event.highlight_type || 'none',
  is_sponsored: event.is_sponsored || false,
  age_rating: event.age_rating,
  genres: event.genres || [],
  slug: event.slug,
  ticket_url: event.ticket_url,
  lineup: event.lineup_slots?.map((slot: any) => ({
    name: slot.slot_name,
    is_headliner: slot.is_headliner
  })) || []
});

export { EventCardV3, EventGrid };