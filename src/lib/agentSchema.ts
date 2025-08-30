import { z } from 'zod';

// Base schema for common fields
const baseSchema = {
  name: z.string().min(2, 'Nome obrigatório').max(200, 'Nome muito longo'),
  slug: z.string().min(2, 'Slug obrigatório'),
  city_id: z.coerce.number().int().positive('Cidade é obrigatória').optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  bio_short: z.string().max(280, 'Bio muito longa').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
};

// Artist specific schema
export const artistSchema = z.object({
  type: z.literal('artist'),
  ...baseSchema,
  artist_subtype: z.enum(['banda', 'dj', 'solo', 'drag']).optional(),
  spotify_url: z.string().url('URL inválida').optional().or(z.literal('')),
  soundcloud_url: z.string().url('URL inválida').optional().or(z.literal('')),
  youtube_url: z.string().url('URL inválida').optional().or(z.literal('')),
  beatport_url: z.string().url('URL inválida').optional().or(z.literal('')),
  profile_image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  presskit_url: z.string().url('URL inválida').optional().or(z.literal('')),
});

// Venue specific schema
export const venueSchema = z.object({
  type: z.literal('venue'),
  ...baseSchema,
  venue_type_id: z.coerce.number().int().positive('Tipo de local é obrigatório').optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  capacity: z.coerce.number().int().positive('Capacidade deve ser positiva').optional(),
  rules: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Organizer specific schema
export const organizerSchema = z.object({
  type: z.literal('organizer'),
  ...baseSchema,
  organizer_subtype: z.enum(['organizador', 'produtora', 'coletivo', 'selo']).optional(),
  booking_email: z.string().email('Email inválido').optional().or(z.literal('')),
  booking_whatsapp: z.string().optional(),
});

// Discriminated union schema
export const AgentSchema = z.discriminatedUnion('type', [
  artistSchema,
  venueSchema, 
  organizerSchema,
]);

export type AgentFormValues = z.infer<typeof AgentSchema>;

// Legacy exports for compatibility
export const agentSchema = AgentSchema;
export type AgentFormData = AgentFormValues;

// Options for form selects
export const AGENT_TYPES = [
  { value: 'artist', label: 'Artista' },
  { value: 'venue', label: 'Local' },
  { value: 'organizer', label: 'Organizador' },
];

export const ARTIST_SUBTYPES = [
  { value: 'banda', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'solo', label: 'Solo' },
  { value: 'drag', label: 'Drag' },
];

// Remove VENUE_TYPES static array since we now use the venue_types table from database

export const ORGANIZER_SUBTYPES = [
  { value: 'organizador', label: 'Organizador' },
  { value: 'produtora', label: 'Produtora' },
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'selo', label: 'Selo' },
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

// Remove CITIES array since we now use the cities table from database