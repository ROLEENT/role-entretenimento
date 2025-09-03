import { z } from 'zod';

// Performance schema
const performanceSchema = z.object({
  name: z.string().optional(),
  kind: z.enum(['live', 'performance', 'instalacao', 'intervencao', 'teatro', 'outro']).optional(),
  starts_at: z.string().optional(),
  stage: z.string().optional(),
  notes: z.string().optional(),
});

// Visual art schema
const visualArtSchema = z.object({
  name: z.string().optional(),
  artist: z.string().optional(),
  technique: z.string().optional(),
  description: z.string().optional(),
  portfolio_url: z.string().url().optional().or(z.literal('')),
});

// Supporter/Sponsor schema
const supporterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  logo_url: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  tier: z.enum(['bronze', 'prata', 'ouro', 'diamante']).optional(),
});

// Links schema
const linksSchema = z.object({
  tickets: z.string().url().optional().or(z.literal('')),
  site: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  map: z.string().url().optional().or(z.literal('')),
  playlist: z.string().url().optional().or(z.literal('')),
  video: z.string().url().optional().or(z.literal('')),
  previous_edition: z.string().url().optional().or(z.literal('')),
});

// Ticketing schema
const ticketingSchema = z.object({
  platform: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  price_rules: z.object({
    free: z.boolean().default(false),
    friend_list: z.boolean().default(false),
    half_price: z.boolean().default(false),
    min_price: z.number().min(0).optional(),
    max_price: z.number().min(0).optional(),
  }).optional(),
  age_rating: z.enum(['L', '10', '12', '14', '16', '18']).optional(),
});

// Main event schema
export const zEvent = z.object({
  // Basic identity
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  description: z.string().optional(),
  
  // Dates and location
  start_utc: z.string().optional(),
  end_utc: z.string().optional(),
  doors_open_utc: z.string().optional(),
  venue_id: z.string().uuid().optional().or(z.literal('')),
  free_address: z.string().optional(),
  
  // Organization
  organizer_ids: z.array(z.string().uuid()).default([]),
  supporters: z.array(supporterSchema).default([]),
  sponsors: z.array(supporterSchema).default([]),
  
  // Content and lineup
  artists_names: z.array(z.string()).default([]),
  performances: z.array(performanceSchema).default([]),
  visual_art: z.array(visualArtSchema).default([]),
  tags: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  
  // Media
  cover_url: z.string().optional(),
  cover_alt: z.string().optional(),
  og_image_url: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  
  // Publication and visibility
  status: z.enum(['draft', 'review', 'scheduled', 'published', 'archived']).default('draft'),
  highlight_type: z.enum(['none', 'featured', 'vitrine']).default('none'),
  is_sponsored: z.boolean().default(false),
  publish_at: z.string().optional(),
  published_at: z.string().optional(),
  
  // Series
  series_id: z.string().uuid().optional(),
  edition_number: z.number().optional(),
  
  // SEO
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  
  // External links and ticketing
  links: linksSchema.optional(),
  ticketing: ticketingSchema.optional(),
});

export type EventFormV3 = z.infer<typeof zEvent>;

// Validation function for publishing
export function validateEventForPublish(data: EventFormV3): string[] {
  const errors: string[] = [];
  
  if (!data.title?.trim()) errors.push('Título é obrigatório');
  if (!data.slug?.trim()) errors.push('Slug é obrigatório');
  if (!data.city?.trim()) errors.push('Cidade é obrigatória');
  if (!data.start_utc) errors.push('Data de início é obrigatória');
  if (!data.venue_id && !data.free_address?.trim()) {
    errors.push('Local ou endereço é obrigatório');
  }
  if (!data.cover_url?.trim()) errors.push('Imagem de capa é obrigatória');
  if (data.cover_url && !data.cover_alt?.trim()) {
    errors.push('Texto alternativo da capa é obrigatório');
  }
  if (!data.organizer_ids?.length) errors.push('Pelo menos um organizador é obrigatório');
  
  return errors;
}