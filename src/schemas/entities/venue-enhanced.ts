import { z } from "zod";

// Enhanced venue schema with dynamic fields based on type
export const venueEnhancedSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic Info - Required
  name: z.string().min(2, "Nome é obrigatório").max(200, "Nome muito longo"),
  slug: z.string().optional(), // Auto-generated from name
  
  // Type - Required for dynamic fields
  type: z.enum(['bar', 'teatro', 'clube', 'restaurante', 'casa-noturna', 'espaco-cultural', 'outro']),
  
  // Location - Required complete address
  address_line: z.string().min(5, "Endereço completo é obrigatório"),
  district: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  postal_code: z.string().min(8, "CEP é obrigatório"),
  country: z.string().default('Brasil'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Description - Required short bio
  bio_short: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres").max(500, "Descrição muito longa"),
  about: z.string().max(3000, "Sobre muito extenso").optional(),
  
  // Contact - Required
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  whatsapp: z.string().optional(),
  instagram: z.string().min(1, "Instagram é obrigatório"),
  website: z.string().url("URL inválida").optional().or(z.literal('')),
  
  // Media - Required main image
  logo_url: z.string().url("URL da logo inválida"),
  logo_alt: z.string().min(5, "Descrição da logo é obrigatória"),
  cover_url: z.string().url("URL inválida").optional(),
  cover_alt: z.string().optional(),
  gallery: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    caption: z.string().optional()
  })).default([]),
  
  // Capacity and Hours
  capacity: z.number().int().positive("Capacidade deve ser um número positivo").optional(),
  opening_hours: z.object({
    monday: z.object({ open: z.string(), close: z.string() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string() }).optional(),
    friday: z.object({ open: z.string(), close: z.string() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string() }).optional(),
    sunday: z.object({ open: z.string(), close: z.string() }).optional(),
  }).optional(),
  
  // Type-specific fields
  // Bar specific
  bar_style: z.array(z.string()).default([]), // Cocktails, Cerveja artesanal, Vinhos, etc.
  ambient_type: z.array(z.string()).default([]), // Intimista, Agitado, Descontraído
  drink_specialties: z.array(z.string()).default([]),
  
  // Teatro specific
  stage_type: z.string().optional(), // Italiana, Arena, Elisabetano
  seating_capacity: z.number().int().positive().optional(),
  acoustic_treatment: z.boolean().default(false),
  technical_equipment: z.array(z.string()).default([]),
  
  // Clube specific
  dance_floor_size: z.number().positive().optional(),
  sound_system: z.string().optional(),
  lighting_system: z.string().optional(),
  vip_areas: z.boolean().default(false),
  
  // Restaurante specific
  cuisine_type: z.array(z.string()).default([]),
  price_range: z.enum(['economico', 'medio', 'alto', 'premium']).optional(),
  dining_style: z.array(z.string()).default([]), // Fine dining, Casual, Fast casual
  outdoor_seating: z.boolean().default(false),
  
  // Casa Noturna specific
  music_genres: z.array(z.string()).default([]),
  show_structure: z.object({
    stage: z.boolean().default(false),
    backstage: z.boolean().default(false),
    green_room: z.boolean().default(false),
    load_in: z.string().optional()
  }).optional(),
  
  // General Features
  features: z.object({
    parking: z.boolean().default(false),
    wifi: z.boolean().default(false),
    air_conditioning: z.boolean().default(false),
    accessibility: z.boolean().default(false),
    security: z.boolean().default(false),
    coat_check: z.boolean().default(false),
    outdoor_area: z.boolean().default(false),
    private_events: z.boolean().default(false),
  }).default({}),
  
  // Business Info
  booking_contact: z.object({
    name: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    role: z.string().optional()
  }).optional(),
  
  // Internal
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  priority: z.number().int().default(0),
  internal_notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type VenueEnhancedForm = z.infer<typeof venueEnhancedSchema>;

// Options for selects
export const VENUE_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'clube', label: 'Clube' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'casa-noturna', label: 'Casa Noturna' },
  { value: 'espaco-cultural', label: 'Espaço Cultural' },
  { value: 'outro', label: 'Outro' },
];

export const BAR_STYLES = [
  'Cocktails Clássicos', 'Cerveja Artesanal', 'Vinhos', 'Destilados',
  'Drinks Autorais', 'Bar de Praia', 'Pub', 'Lounge', 'Rooftop'
];

export const AMBIENT_TYPES = [
  'Intimista', 'Agitado', 'Descontraído', 'Elegante', 'Alternativo',
  'Familiar', 'Romântico', 'Festivo', 'Underground'
];

export const CUISINE_TYPES = [
  'Brasileira', 'Italiana', 'Japonesa', 'Francesa', 'Mexicana',
  'Árabe', 'Vegetariana', 'Vegana', 'Fusion', 'Contemporânea',
  'Comfort Food', 'Street Food'
];

export const MUSIC_GENRES = [
  'Techno', 'House', 'Funk', 'Rap', 'Pop', 'Rock', 'Indie', 'Electronic',
  'Jazz', 'Blues', 'MPB', 'Samba', 'Reggae', 'Alternative'
];

export const STAGE_TYPES = [
  'Italiana', 'Arena', 'Elisabetano', 'Thrust', 'Black Box', 'Cabaret'
];

export const TECHNICAL_EQUIPMENT = [
  'Sistema de Som', 'Iluminação LED', 'Projetores', 'Telas', 'Microfones',
  'Mesa de Som', 'Amplificadores', 'Caixas de Retorno'
];