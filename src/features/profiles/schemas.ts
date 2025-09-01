import { z } from "zod";

// Common schema for all profile types
export const commonSchema = z.object({
  type: z.enum(['artista','local','organizador']),
  name: z.string().min(2).max(80),
  handle: z.string().min(3).max(30).regex(/^[a-z0-9.]+$/, "Handle deve conter apenas letras minúsculas, números e pontos"),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2).default('BR'),
  bio_short: z.string().max(160),
  bio: z.string().max(1200).optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  links: z.array(z.object({ 
    type: z.string(), 
    url: z.string().url() 
  })).optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional().or(z.literal("")),
  visibility: z.enum(['public','draft','private']).default('public'),
  avatar_file: z.any().optional(),
  cover_file: z.any().optional()
});

// Artist-specific schema
export const artistSchema = z.object({
  genres: z.array(z.string()).min(1, "Selecione pelo menos um gênero"),
  agency: z.string().optional().or(z.literal("")),
  touring_city: z.string().optional().or(z.literal("")),
  fee_band: z.enum(['<=2k','2-5k','5-10k','10k+']).optional(),
  rider_url: z.string().url().optional().or(z.literal("")),
  stageplot_url: z.string().url().optional().or(z.literal("")),
  presskit_url: z.string().url().optional().or(z.literal("")),
  spotify_id: z.string().optional().or(z.literal("")),
  soundcloud_url: z.string().url().optional().or(z.literal("")),
  youtube_url: z.string().url().optional().or(z.literal("")),
  pronoun: z.string().optional().or(z.literal(""))
});

// Venue-specific schema
export const venueSchema = z.object({
  capacity: z.coerce.number().int().positive("Capacidade deve ser um número positivo"),
  address: z.any().optional(),
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  place_id: z.string().optional().or(z.literal("")),
  hours: z.any().optional(),
  price_range: z.enum(['$','$$','$$$']).optional(),
  accessibility: z.any().optional(),
  age_policy: z.string().min(2, "Política de idade é obrigatória"),
  sound_gear: z.any().optional(),
  cnpj: z.string().optional().or(z.literal(""))
});

// Organizer-specific schema
export const orgSchema = z.object({
  brand_name: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  manager_name: z.string().optional().or(z.literal("")),
  manager_email: z.string().email().optional().or(z.literal("")),
  manager_phone: z.string().optional().or(z.literal("")),
  cities: z.array(z.string()).optional(),
  about: z.string().optional().or(z.literal(""))
});

// Discriminated union for creating profiles
export const createProfileSchema = z.discriminatedUnion("type", [
  commonSchema.merge(artistSchema).extend({ type: z.literal('artista') }),
  commonSchema.merge(venueSchema).extend({ type: z.literal('local') }),
  commonSchema.merge(orgSchema).extend({ type: z.literal('organizador') })
]);

// Type inference
export type CommonProfileData = z.infer<typeof commonSchema>;
export type ArtistProfileData = z.infer<typeof artistSchema>;
export type VenueProfileData = z.infer<typeof venueSchema>;
export type OrgProfileData = z.infer<typeof orgSchema>;
export type CreateProfile = z.infer<typeof createProfileSchema>;