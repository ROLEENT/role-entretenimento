import { z } from "zod";

// Schema comum para todos os tipos de perfil
export const commonSchema = z.object({
  type: z.enum(['artista','local','organizador']),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(80, "Nome deve ter no máximo 80 caracteres"),
  handle: z.string()
    .min(3, "Handle deve ter pelo menos 3 caracteres")
    .max(30, "Handle deve ter no máximo 30 caracteres")
    .regex(/^[a-z0-9.]+$/, "Handle deve conter apenas letras minúsculas, números e pontos"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  country: z.string().min(2, "País é obrigatório"),
  bio_short: z.string().max(160, "Bio curta deve ter no máximo 160 caracteres"),
  bio: z.string().max(1200, "Bio deve ter no máximo 1200 caracteres").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  links: z.array(z.object({ 
    type: z.string(), 
    url: z.string().url("URL deve ser válida") 
  })).optional(),
  contact_email: z.string().email("Email deve ser válido").optional().or(z.literal("")),
  contact_phone: z.string().optional().or(z.literal("")),
  visibility: z.enum(['public','draft','private']),
  avatar_file: z.any().optional(),
  cover_file: z.any().optional()
});

// Schema específico para artistas
export const artistSchema = z.object({
  genres: z.array(z.string()).min(1, "Pelo menos um gênero deve ser selecionado"),
  agency: z.string().optional().or(z.literal("")),
  touring_city: z.string().optional().or(z.literal("")),
  fee_band: z.enum(['<=2k','2-5k','5-10k','10k+']).optional(),
  rider_url: z.string().url("URL deve ser válida").optional().or(z.literal("")),
  stageplot_url: z.string().url("URL deve ser válida").optional().or(z.literal("")),
  presskit_url: z.string().url("URL deve ser válida").optional().or(z.literal("")),
  spotify_id: z.string().optional().or(z.literal("")),
  soundcloud_url: z.string().url("URL deve ser válida").optional().or(z.literal("")),
  youtube_url: z.string().url("URL deve ser válida").optional().or(z.literal("")),
  pronoun: z.string().optional().or(z.literal(""))
});

// Schema específico para locais/venues
export const venueSchema = z.object({
  capacity: z.coerce.number({
    required_error: "Capacidade é obrigatória",
    invalid_type_error: "Capacidade deve ser um número"
  }).int("Capacidade deve ser um número inteiro").positive("Capacidade deve ser positiva"),
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

// Schema específico para organizadores
export const orgSchema = z.object({
  brand_name: z.string().optional().or(z.literal("")),
  cnpj: z.string().optional().or(z.literal("")),
  manager_name: z.string().optional().or(z.literal("")),
  manager_email: z.string().email("Email deve ser válido").optional().or(z.literal("")),
  manager_phone: z.string().optional().or(z.literal("")),
  cities: z.array(z.string()).optional(),
  about: z.string().optional().or(z.literal(""))
});

// Schema dinâmico baseado no tipo
export const createProfileSchema = z.discriminatedUnion("type", [
  commonSchema.merge(artistSchema.partial()).extend({ type: z.literal("artista") }),
  commonSchema.merge(venueSchema.partial()).extend({ type: z.literal("local") }),
  commonSchema.merge(orgSchema.partial()).extend({ type: z.literal("organizador") })
]);

// Types derivados dos schemas
export type CommonProfileData = z.infer<typeof commonSchema>;
export type ArtistProfileData = z.infer<typeof artistSchema>;
export type VenueProfileData = z.infer<typeof venueSchema>;
export type OrgProfileData = z.infer<typeof orgSchema>;
export type CreateProfile = z.infer<typeof createProfileSchema>;