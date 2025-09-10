import { z } from "zod";

// Flexible schema for artists with minimal required fields
export const artistFlexibleSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Core fields - only stage_name is required
  stage_name: z.string().min(1, "Nome artístico é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  artist_type: z.string().optional(),
  category_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
  
  // Bio fields - all optional
  bio_short: z.string().optional().nullable(),
  bio_long: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  
  // Contact info - all optional with proper validation
  email: z.string().email("Email inválido").optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  booking_email: z.string().email("Email inválido").optional().or(z.literal('')).nullable(),
  booking_whatsapp: z.string().optional().nullable(),
  booking_phone: z.string().optional().nullable(),
  
  // Location - all optional
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default('BR'),
  home_city: z.string().optional().nullable(),
  cities_active: z.array(z.string()).default([]),
  
  // Social media & URLs - all optional with URL validation
  instagram: z.string().optional().nullable(),
  website: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  website_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  spotify_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  soundcloud_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(), 
  youtube_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  beatport_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  audius_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  links: z.object({
    facebook: z.string().url("URL inválida").optional().or(z.literal('')),
    linkedin: z.string().url("URL inválida").optional().or(z.literal('')),
    twitter: z.string().url("URL inválida").optional().or(z.literal('')),
    tiktok: z.string().url("URL inválida").optional().or(z.literal('')),
  }).optional(),
  
  // Professional info - all optional
  fee_range: z.string().optional().nullable(),
  show_format: z.string().optional().nullable(),
  team_size: z.number().optional().nullable(),
  set_time_minutes: z.number().optional().nullable(),
  availability_days: z.array(z.string()).default([]),
  
  // Technical requirements - all optional
  tech_audio: z.string().optional().nullable(),
  tech_light: z.string().optional().nullable(),
  tech_stage: z.string().optional().nullable(),
  tech_rider_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  
  // Media - all optional with URL validation
  profile_image_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  cover_image_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  avatar_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  presskit_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  
  // Management - all optional
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
  genres: z.array(z.string()).default([]),
  
  // Timestamps (handled by database)
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Flexible schema for organizers with minimal required fields
export const organizerFlexibleSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Only name is required
  name: z.string().min(2, "Nome é obrigatório"),
  slug: z.string().optional(), // Auto-generated
  
  // All other fields optional with validation
  site: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  email: z.string().email("Email inválido").optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  
  // Contact info - all optional
  instagram: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  
  // Invoice/billing info - all optional with validation
  invoice_name: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  invoice_email: z.string().email("Email inválido").optional().or(z.literal('')).nullable(),
  pix_key: z.string().optional().nullable(),
  
  // Bank info - all optional
  bank: z.object({
    bank: z.string().optional(),
    agency: z.string().optional(), 
    account: z.string().optional(),
    type: z.enum(['corrente', 'poupanca']).optional(),
  }).optional(),
  
  // Additional links - all optional with URL validation
  links: z.object({
    facebook: z.string().url("URL inválida").optional().or(z.literal('')),
    linkedin: z.string().url("URL inválida").optional().or(z.literal('')),
    youtube: z.string().url("URL inválida").optional().or(z.literal('')),
    tiktok: z.string().url("URL inválida").optional().or(z.literal('')),
    twitter: z.string().url("URL inválida").optional().or(z.literal('')),
  }).optional(),
  
  // Location - all optional
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('BR'),
  
  // Content - all optional
  bio: z.string().optional(),
  
  // Media - all optional with URL validation
  avatar_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  avatar_alt: z.string().optional(),
  cover_url: z.string().url("URL inválida").optional().or(z.literal('')).nullable(),
  cover_alt: z.string().optional(),
  
  // Metadata
  priority: z.number().int().default(0),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type ArtistFlexibleForm = z.infer<typeof artistFlexibleSchema>;
export type OrganizerFlexibleForm = z.infer<typeof organizerFlexibleSchema>;