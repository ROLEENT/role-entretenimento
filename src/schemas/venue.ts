import { z } from "zod";

// Helper function to validate slug format
const validateSlugFormat = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Status enum
export const VenueStatus = z.enum(['active', 'inactive']);
export type VenueStatusType = z.infer<typeof VenueStatus>;

// Amenities schema - boolean object for venue features
export const venueAmenitiesSchema = z.object({
  accessible: z.boolean().default(false),
  stage: z.boolean().default(false),
  sound: z.boolean().default(false),
  lighting: z.boolean().default(false),
  parking: z.boolean().default(false),
  food: z.boolean().default(false),
  smoking: z.boolean().default(false),
}).default({});

// Opening hours schema - object with short text for each day
export const venueOpeningHoursSchema = z.object({
  monday: z.string().max(20, "Horário muito longo").default(""),
  tuesday: z.string().max(20, "Horário muito longo").default(""),
  wednesday: z.string().max(20, "Horário muito longo").default(""),
  thursday: z.string().max(20, "Horário muito longo").default(""),
  friday: z.string().max(20, "Horário muito longo").default(""),
  saturday: z.string().max(20, "Horário muito longo").default(""),
  sunday: z.string().max(20, "Horário muito longo").default(""),
}).default({});

// Venue schema
export const venueSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic info
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome muito longo"),
  
  slug: z.string()
    .optional()
    .refine(
      (slug) => !slug || validateSlugFormat(slug),
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
  
  // Address info
  address_line: z.string()
    .max(300, "Endereço muito longo")
    .optional(),
  
  district: z.string()
    .max(100, "Bairro muito longo")
    .optional(),
  
  city: z.string()
    .max(100, "Cidade muito longa")
    .optional(),
  
  state: z.string()
    .max(50, "Estado muito longo")
    .optional(),
  
  postal_code: z.string()
    .max(20, "CEP muito longo")
    .optional(),
  
  country: z.string().default('BR'),
  
  // Geographic coordinates
  latitude: z.number()
    .min(-90, "Latitude inválida")
    .max(90, "Latitude inválida")
    .optional(),
  
  longitude: z.number()
    .min(-180, "Longitude inválida")
    .max(180, "Longitude inválida")
    .optional(),
  
  // Venue details
  capacity: z.number()
    .int("Capacidade deve ser um número inteiro")
    .positive("Capacidade deve ser positiva")
    .optional(),
  
  // Structured data
  amenities: venueAmenitiesSchema,
  opening_hours: venueOpeningHoursSchema,
  
  // Contact info
  instagram: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal('')),
  
  // Content
  about: z.string().optional(),

  tags: z.array(z.string())
    .max(12, "Máximo de 12 tags permitidas")
    .default([]),

  // Media
  cover_url: z.string().optional(),
  cover_alt: z.string().optional(),
  gallery_urls: z.array(z.string()).default([]),
  
  // Metadata
  status: VenueStatus.default('active'),
  priority: z.number().int().default(0),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine(
  (data) => {
    // Custom validation: if cover_url is present, require cover_alt
    if (data.cover_url && !data.cover_alt) {
      return false;
    }
    return true;
  },
  {
    message: "Texto alternativo é obrigatório quando uma imagem de capa é fornecida",
    path: ["cover_alt"]
  }
);

export type VenueFormData = z.infer<typeof venueSchema>;
export type VenueAmenities = z.infer<typeof venueAmenitiesSchema>;
export type VenueOpeningHours = z.infer<typeof venueOpeningHoursSchema>;

// Export for form options
export const VENUE_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
] as const;

// Helper for amenities labels
export const AMENITIES_LABELS = {
  accessible: "Acessível",
  stage: "Palco",
  sound: "Sistema de Som",
  lighting: "Iluminação",
  parking: "Estacionamento",
  food: "Alimentação",
  smoking: "Área para Fumantes",
} as const;

// Helper for days labels
export const DAYS_LABELS = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
} as const;