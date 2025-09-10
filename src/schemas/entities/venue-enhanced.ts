import { z } from "zod";

// Enhanced venue schema with dynamic fields based on type
export const venueEnhancedSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic Info - Required
  name: z.string().min(2, "Nome é obrigatório").max(200, "Nome muito longo"),
  handle: z.string().min(3, "Handle deve ter pelo menos 3 caracteres").max(30, "Handle muito longo")
    .regex(/^[a-z0-9._-]+$/, "Handle deve conter apenas letras minúsculas, números, pontos, hífens e underscores"),
  slug: z.string().optional(), // Auto-generated from handle
  
  // Venue Type - Required for dynamic fields
  type: z.enum(['bar', 'teatro', 'clube', 'restaurante', 'casa-noturna', 'galeria', 'espaco-cultural', 'outro']),
  capacity: z.number().int().positive("Capacidade deve ser um número positivo"),
  
  // Location - Required full address
  address: z.object({
    street: z.string().min(5, "Endereço completo é obrigatório"),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro é obrigatório"),
    city: z.string().min(2, "Cidade é obrigatória"),
    state: z.string().min(2, "Estado é obrigatório"),
    postal_code: z.string().optional(),
    country: z.string().default('Brasil')
  }),
  
  // Google Maps Integration
  location: z.object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    place_id: z.string().optional(),
    formatted_address: z.string().optional()
  }).optional(),
  
  // Bio - Required short description
  bio_short: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres").max(500, "Descrição muito longa"),
  description: z.string().max(2000, "Descrição muito extensa").optional(),
  
  // Contact - Required
  contact: z.object({
    email: z.string().email("Email inválido").optional(),
    phone: z.string().optional(),
    whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
    instagram: z.string().min(1, "Instagram é obrigatório"),
    website: z.string().url("URL inválida").optional().or(z.literal(''))
  }),
  
  // Media - Required main image
  logo_url: z.string().url("URL do logo inválida"),
  logo_alt: z.string().min(5, "Descrição do logo é obrigatória"),
  cover_image_url: z.string().url("URL inválida").optional(),
  cover_image_alt: z.string().optional(),
  gallery: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    caption: z.string().optional()
  })).default([]),
  
  // Operating Hours
  hours: z.object({
    monday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    tuesday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    wednesday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    thursday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    friday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    saturday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    sunday: z.object({ open: z.string().optional(), close: z.string().optional(), closed: z.boolean().default(false) }).optional(),
    special_hours: z.string().optional()
  }).optional(),
  
  // Type-specific features
  // Bar specific
  bar_features: z.object({
    happy_hour: z.boolean().default(false),
    craft_beer: z.boolean().default(false),
    cocktails: z.boolean().default(false),
    wine_selection: z.boolean().default(false),
    outdoor_seating: z.boolean().default(false),
    pool_table: z.boolean().default(false),
    sports_tv: z.boolean().default(false),
    live_music: z.boolean().default(false)
  }).optional(),
  
  // Theater specific
  theater_features: z.object({
    stage_type: z.enum(['italiana', 'arena', 'elizabetana', 'alternativo']).optional(),
    seating_capacity: z.number().int().positive().optional(),
    technical_equipment: z.array(z.string()).default([]),
    backstage_rooms: z.number().int().min(0).default(0),
    accessibility_features: z.array(z.string()).default([])
  }).optional(),
  
  // Club specific
  club_features: z.object({
    sound_system: z.string().optional(),
    lighting_system: z.string().optional(),
    dance_floor_size: z.number().positive().optional(),
    vip_areas: z.boolean().default(false),
    smoking_area: z.boolean().default(false),
    coat_check: z.boolean().default(false),
    security_level: z.enum(['basica', 'media', 'alta']).optional()
  }).optional(),
  
  // Restaurant specific
  restaurant_features: z.object({
    cuisine_type: z.array(z.string()).default([]),
    price_range: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
    serves_alcohol: z.boolean().default(false),
    outdoor_dining: z.boolean().default(false),
    private_dining: z.boolean().default(false),
    catering: z.boolean().default(false),
    dietary_options: z.object({
      vegetarian: z.boolean().default(false),
      vegan: z.boolean().default(false),
      gluten_free: z.boolean().default(false),
      halal: z.boolean().default(false),
      kosher: z.boolean().default(false)
    }).default({})
  }).optional(),
  
  // Accessibility
  accessibility: z.object({
    wheelchair_accessible: z.boolean().default(false),
    elevator: z.boolean().default(false),
    accessible_parking: z.boolean().default(false),
    accessible_restrooms: z.boolean().default(false),
    audio_assistance: z.boolean().default(false),
    sign_language: z.boolean().default(false),
    service_animals: z.boolean().default(false),
    notes: z.string().optional()
  }).optional(),
  
  // Amenities
  amenities: z.object({
    wifi: z.boolean().default(false),
    air_conditioning: z.boolean().default(false),
    heating: z.boolean().default(false),
    parking: z.boolean().default(false),
    valet_parking: z.boolean().default(false),
    public_transport: z.boolean().default(false),
    credit_cards: z.boolean().default(false),
    reservations: z.boolean().default(false),
    private_events: z.boolean().default(false)
  }).optional(),
  
  // Rules and Policies
  policies: z.object({
    age_restriction: z.enum(['livre', '16+', '18+', '21+']).default('livre'),
    dress_code: z.enum(['casual', 'smart-casual', 'formal', 'themed']).optional(),
    entry_fee: z.boolean().default(false),
    smoking_policy: z.enum(['permitido', 'area-fumantes', 'proibido']).default('proibido'),
    pet_policy: z.enum(['permitido', 'area-externa', 'proibido']).default('proibido'),
    photography: z.enum(['permitido', 'autorizado', 'proibido']).default('permitido'),
    outside_food: z.boolean().default(false),
    outside_drinks: z.boolean().default(false)
  }).optional(),
  
  // Links Externos
  links: z.object({
    instagram: z.string().min(1, "Instagram é obrigatório"),
    facebook: z.string().url("URL inválida").optional().or(z.literal('')),
    website: z.string().url("URL inválida").optional().or(z.literal('')),
    delivery_apps: z.array(z.object({
      name: z.string(),
      url: z.string().url()
    })).default([]),
    booking_platforms: z.array(z.object({
      name: z.string(),
      url: z.string().url()
    })).default([])
  }),
  
  // Internal
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  priority: z.number().int().default(0),
  internal_notes: z.string().optional(),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type-specific validation
export const validateVenueByType = (data: z.infer<typeof venueEnhancedSchema>) => {
  const errors: string[] = [];
  
  switch (data.type) {
    case 'teatro':
      if (!data.theater_features?.stage_type) errors.push("Tipo de palco é obrigatório para teatros");
      if (!data.theater_features?.seating_capacity) errors.push("Capacidade de assentos é obrigatória");
      break;
      
    case 'restaurante':
      if (!data.restaurant_features?.cuisine_type || data.restaurant_features.cuisine_type.length === 0) {
        errors.push("Tipo de culinária é obrigatório para restaurantes");
      }
      if (!data.restaurant_features?.price_range) errors.push("Faixa de preço é obrigatória");
      break;
      
    case 'clube':
    case 'casa-noturna':
      if (!data.club_features?.sound_system) errors.push("Sistema de som é obrigatório para clubes");
      break;
  }
  
  return errors;
};

export type VenueEnhancedForm = z.infer<typeof venueEnhancedSchema>;

// Options for selects
export const VENUE_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'clube', label: 'Clube' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'casa-noturna', label: 'Casa Noturna' },
  { value: 'galeria', label: 'Galeria' },
  { value: 'espaco-cultural', label: 'Espaço Cultural' },
  { value: 'outro', label: 'Outro' },
];

export const CUISINE_TYPES = [
  'Brasileira', 'Italiana', 'Japonesa', 'Árabe', 'Mexicana', 'Indiana',
  'Francesa', 'Chinesa', 'Tailandesa', 'Mediterrânea', 'Americana',
  'Vegana', 'Vegetariana', 'Fusion', 'Contemporânea', 'Tradicional'
];

export const STAGE_TYPES = [
  { value: 'italiana', label: 'Italiana (Palco Frontal)' },
  { value: 'arena', label: 'Arena (360°)' },
  { value: 'elizabetana', label: 'Elizabetana (Três Lados)' },
  { value: 'alternativo', label: 'Alternativo' }
];