import { z } from 'zod';

// Helper functions for data transformation
const phoneDigits = (s: string) => s?.replace(/\D/g, '') || '';
const normalizeInstagram = (s: string) => s ? s.replace(/^@+/, '') : s;
const normalizeUrl = (url: string) => {
  if (!url) return url;
  if (!/^https?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
};

// Base schema for common fields
const baseSchema = {
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200, 'Nome muito longo (máximo 200 caracteres)'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres'),
  city_id: z.coerce.number().int().positive('Cidade é obrigatória').optional(),
  instagram: z.string().optional().transform(normalizeInstagram).refine((val) => !val || val.length >= 2, 'Instagram deve ter pelo menos 2 caracteres'),
  whatsapp: z.string().transform(phoneDigits).refine(v => !v || (v.length >= 10 && v.length <= 11), 'WhatsApp deve ter 10 ou 11 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string().optional().transform(normalizeUrl).refine((val) => !val || z.string().url().safeParse(val).success, 'URL inválida'),
  bio_short: z.string().max(280, 'Bio deve ter no máximo 280 caracteres').optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
};

// Artist specific schema
export const artistSchema = z.object({
  type: z.literal('artist'),
  ...baseSchema,
  artist_subtype: z.enum(['banda', 'dj', 'solo', 'drag']).optional(),
  spotify_url: z.string().optional().transform(normalizeUrl).refine((val) => !val || z.string().url().safeParse(val).success, 'URL do Spotify inválida'),
  soundcloud_url: z.string().optional().transform(normalizeUrl).refine((val) => !val || z.string().url().safeParse(val).success, 'URL do SoundCloud inválida'),
  youtube_url: z.string().optional().transform(normalizeUrl).refine((val) => !val || z.string().url().safeParse(val).success, 'URL do YouTube inválida'),
  beatport_url: z.string().optional().transform(normalizeUrl).refine((val) => !val || z.string().url().safeParse(val).success, 'URL do Beatport inválida'),
  profile_image_url: z.string().optional().transform(normalizeUrl).refine((val) => !val || z.string().url().safeParse(val).success, 'URL da imagem inválida'),
  presskit_url: z.string().optional().transform(normalizeUrl).refine((val) => !val || z.string().url().safeParse(val).success, 'URL do presskit inválida'),
});

// Venue specific schema
export const venueSchema = z.object({
  type: z.literal('venue'),
  ...baseSchema,
  venue_type_id: z.coerce.number().int().positive('Tipo de local é obrigatório').optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  capacity: z.coerce.number().int().positive('Capacidade deve ser um número positivo').optional(),
  rules: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Organizer specific schema
export const organizerSchema = z.object({
  type: z.literal('organizer'),
  ...baseSchema,
  organizer_subtype: z.enum(['organizador', 'produtora', 'coletivo', 'selo']).optional(),
  booking_email: z.string().email('Email de booking inválido').optional().or(z.literal('')),
  booking_whatsapp: z.string().optional().transform(phoneDigits).refine(v => !v || (v.length >= 10 && v.length <= 11), 'WhatsApp de booking deve ter 10 ou 11 dígitos'),
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
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
];

// Remove CITIES array since we now use the cities table from database