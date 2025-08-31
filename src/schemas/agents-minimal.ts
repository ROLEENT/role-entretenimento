import { z } from 'zod';

// Schemas mínimos para agentes - apenas campos obrigatórios conforme banco

export const MinimalArtistSchema = z.object({
  id: z.string().uuid().optional(),
  stage_name: z.string()
    .min(1, "Nome artístico é obrigatório")
    .max(200, "Nome muito longo"),
  slug: z.string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(100, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  artist_type: z.string()
    .min(1, "Tipo de artista é obrigatório")
    .default("banda"),
  booking_email: z.string()
    .email("Email inválido")
    .min(1, "Email é obrigatório"),
  booking_whatsapp: z.string()
    .min(1, "WhatsApp é obrigatório"),
  bio_short: z.string()
    .min(1, "Bio curta é obrigatória")
    .max(500, "Bio muito longa"),
  profile_image_url: z.string()
    .url("URL da imagem inválida")
    .min(1, "Imagem de perfil é obrigatória"),
  status: z.enum(["active", "inactive"]).default("active"),
  // Campos opcionais básicos
  instagram: z.string().optional(),
  city: z.string().optional(),
  spotify_url: z.string().url("URL do Spotify inválida").optional().or(z.literal("")),
  youtube_url: z.string().url("URL do YouTube inválida").optional().or(z.literal("")),
  website_url: z.string().url("URL do site inválida").optional().or(z.literal("")),
});

export const MinimalVenueSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome muito longo"),
  slug: z.string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(100, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  address: z.string()
    .min(1, "Endereço é obrigatório"),
  city_id: z.number().int().positive("Cidade é obrigatória").optional(),
  state: z.string()
    .min(2, "Estado é obrigatório")
    .default("SP"),
  // Campos opcionais básicos
  venue_type_id: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  contacts_json: z.object({
    instagram: z.string().optional(),
    whatsapp: z.string().optional(), 
    email: z.string().email().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

export const MinimalOrganizerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome muito longo"),
  slug: z.string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(100, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  contact_email: z.string()
    .email("Email inválido")
    .min(1, "Email é obrigatório"),
  contact_whatsapp: z.string()
    .min(1, "WhatsApp é obrigatório"),
  status: z.enum(["active", "inactive"]).default("active"),
  type: z.enum(["organizador", "produtora", "coletivo", "selo"]).default("organizador"),
  // Campos opcionais básicos
  city_id: z.number().int().positive().optional(),
  instagram: z.string().optional(),
  site: z.string().url("URL do site inválida").optional().or(z.literal("")),
  bio_short: z.string().max(500, "Bio muito longa").optional(),
});

// Types
export type MinimalArtist = z.infer<typeof MinimalArtistSchema>;
export type MinimalVenue = z.infer<typeof MinimalVenueSchema>;
export type MinimalOrganizer = z.infer<typeof MinimalOrganizerSchema>;

// Helper functions
export const generateAgentSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Status options for forms
export const AGENT_STATUS_OPTIONS = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
];

export const ARTIST_TYPE_OPTIONS = [
  { value: "banda", label: "Banda" },
  { value: "dj", label: "DJ" },
  { value: "solo", label: "Solo" },
  { value: "drag", label: "Drag" },
];

export const ORGANIZER_TYPE_OPTIONS = [
  { value: "organizador", label: "Organizador" },
  { value: "produtora", label: "Produtora" },
  { value: "coletivo", label: "Coletivo" },
  { value: "selo", label: "Selo" },
];