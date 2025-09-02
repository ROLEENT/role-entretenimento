import { z } from "zod";

// Unified schema that matches exactly the database structure
export const artistSchema = z.object({
  id: z.string().uuid().optional(),
  // Core fields that match database
  slug: z.string()
    .min(2, "Slug é obrigatório")
    .max(80, "Slug deve ter no máximo 80 caracteres")
    .regex(/^[a-z0-9-._]+$/i, "Use apenas letras, números, hífen, ponto e underscore")
    .optional().nullable(),
  stage_name: z.string().min(1, "Nome artístico é obrigatório"),
  artist_type: z.string().min(1, "Tipo de artista é obrigatório"),
  status: z.enum(["active", "inactive"]).default("active"),
  
  // Bio fields
  bio_short: z.string().optional().nullable(),
  bio_long: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  
  // Contact info - allowing empty strings for optional URLs
  email: z.string().email("Email inválido").optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  booking_email: z.string().email("Email inválido").optional().or(z.literal('')).nullable(),
  booking_whatsapp: z.string().optional().nullable(),
  booking_phone: z.string().optional().nullable(),
  
  // Location
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default('BR'),
  home_city: z.string().optional().nullable(),
  cities_active: z.array(z.string()).default([]),
  
  // Social media & URLs - flexible URL validation
  instagram: z.string().optional().nullable(),
  website: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  website_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  spotify_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  soundcloud_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(), 
  youtube_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  beatport_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  audius_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  links: z.record(z.string()).optional(),
  
  // Professional info
  fee_range: z.string().optional().nullable(),
  show_format: z.string().optional().nullable(),
  team_size: z.number().optional().nullable(),
  set_time_minutes: z.number().optional().nullable(),
  availability_days: z.array(z.string()).default([]),
  
  // Technical requirements
  tech_audio: z.string().optional().nullable(),
  tech_light: z.string().optional().nullable(),
  tech_stage: z.string().optional().nullable(),
  tech_rider_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  
  // Media - flexible URL validation
  profile_image_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  cover_image_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  presskit_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  
  // Management
  responsible_name: z.string().optional().nullable(),
  responsible_role: z.string().optional().nullable(),
  real_name: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  accommodation_notes: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  image_credits: z.string().optional().nullable(),
  image_rights_authorized: z.boolean().default(false),
  priority: z.number().default(0),
  tags: z.array(z.string()).default([]),
  
  // Timestamps (handled by database)
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const organizerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").optional().nullable(),
  site: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  email: z.string().email("Email inválido").optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  logo_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ArtistForm = z.infer<typeof artistSchema>;
export type OrganizerForm = z.infer<typeof organizerSchema>;