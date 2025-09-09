import { z } from "zod";

// Enum validations
export const highlightTypeSchema = z.enum(['none', 'curatorial', 'vitrine']);
export const publicationStatusSchema = z.enum(['draft', 'scheduled', 'published', 'archived']);
export const ageRatingSchema = z.enum(['L', '10', '12', '14', '16', '18']);
export const partnerRoleSchema = z.enum(['organizer', 'supporter', 'sponsor']);

// Nested object schemas
export const ticketingSchema = z.object({
  url: z.string().url().optional().or(z.literal('')),
  site: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  links: z.array(z.object({
    url: z.string().url(),
    label: z.string().min(1)
  })).default([])
}).optional();

export const linksSchema = z.object({
  site: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  spotify: z.string().optional(),
  soundcloud: z.string().optional()
}).optional();

export const accessibilitySchema = z.object({
  wheelchair_accessible: z.boolean().default(false),
  audio_description: z.boolean().default(false),
  sign_language: z.boolean().default(false),
  sensory_friendly: z.boolean().default(false),
  notes: z.string().optional()
}).optional();

// Schema para critérios de curadoria
export const curatorialCriterionSchema = z.object({
  checked: z.boolean().default(false),
  note: z.string().optional()
});

export const curatorialCriteriaSchema = z.object({
  cultural_relevance: curatorialCriterionSchema.optional(),
  lineup: curatorialCriterionSchema.optional(),
  visual_identity: curatorialCriterionSchema.optional(),
  experience: curatorialCriterionSchema.optional(),
  city_connection: curatorialCriterionSchema.optional(),
  audience_coherence: curatorialCriterionSchema.optional(),
  engagement_potential: curatorialCriterionSchema.optional(),
  innovation: curatorialCriterionSchema.optional()
}).optional();

export const galleryItemSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  type: z.enum(['image', 'video']).default('image'),
  caption: z.string().optional(),
  position: z.number().int().min(0).default(0)
});

export const ticketRuleSchema = z.object({
  rule: z.string().min(1),
  description: z.string().optional()
});

// Partner schemas for related tables
export const eventPartnerSchema = z.object({
  id: z.string().uuid().optional(),
  partner_id: z.string().uuid().optional(),
  partner_type: z.enum(['organizer', 'venue', 'artist', 'supporter', 'sponsor']),
  role: z.enum(['organizer', 'supporter', 'sponsor']).default('organizer'),
  display_name: z.string().optional(),
  position: z.number().int().min(0).default(0),
  is_main: z.boolean().default(false),
  tier: z.string().optional()
});

export const lineupSlotArtistSchema = z.object({
  artist_id: z.string().uuid(),
  artist_name: z.string().min(1),
  position: z.number().int().min(0).default(0),
  role: z.string().default('performer')
});

export const lineupSlotSchema = z.object({
  id: z.string().uuid().optional(),
  slot_name: z.string().min(1),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  stage: z.string().optional(),
  position: z.number().int().min(0).default(0),
  is_headliner: z.boolean().default(false),
  notes: z.string().optional(),
  artists: z.array(lineupSlotArtistSchema).default([])
});

export const performanceSchema = z.object({
  id: z.string().uuid().optional(),
  performer_name: z.string().min(1),
  performance_type: z.string().min(1),
  description: z.string().optional(),
  start_time: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(1).optional(),
  stage: z.string().optional(),
  position: z.number().int().min(0).default(0),
  contact_info: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    instagram: z.string().optional()
  }).optional()
});

export const visualArtistSchema = z.object({
  id: z.string().uuid().optional(),
  artist_name: z.string().min(1),
  art_type: z.string().min(1),
  description: z.string().optional(),
  installation_location: z.string().optional(),
  contact_info: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    instagram: z.string().optional(),
    portfolio: z.string().url().optional()
  }).optional(),
  artwork_images: z.array(galleryItemSchema).default([]),
  position: z.number().int().min(0).default(0)
});

// Main event schema
export const eventSchema = z.object({
  // Organizers
  organizer_ids: z.array(z.string().uuid()).min(1, "Pelo menos um organizador é obrigatório"),
  // Basic Information
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  subtitle: z.string().max(300, "Subtítulo muito longo").optional(),
  summary: z.string().max(500, "Resumo muito longo").optional(),
  description: z.string().optional(),
  
  // Location
  venue_id: z.string().uuid().nullable().optional(),
  location_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Brasil'),
  
  // Dates & Times
  date_start: z.string().datetime("Data de início deve ser válida"),
  date_end: z.string().datetime("Data de fim deve ser válida").optional(),
  doors_open_utc: z.string().datetime().optional().nullable(),
  headliner_starts_utc: z.string().datetime().optional().nullable(),
  
  // Visual Content
  image_url: z.string().url().optional().or(z.literal('')),
  cover_url: z.string().url().optional().or(z.literal('')),
  cover_alt: z.string().optional(),
  gallery: z.array(galleryItemSchema).default([]),
  
  // Pricing
  price_min: z.number().min(0, "Preço mínimo deve ser positivo").optional(),
  price_max: z.number().min(0, "Preço máximo deve ser positivo").optional(),
  currency: z.string().length(3).default('BRL'),
  
  // Ticketing
  ticket_url: z.string().url().optional().or(z.literal('')),
  ticketing: ticketingSchema,
  ticket_rules: z.array(ticketRuleSchema).default([]),
  
  // Age Rating
  age_rating: ageRatingSchema.optional(),
  age_notes: z.string().optional(),
  
  // Categories & Tags
  genres: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  
  // Promotion & Visibility
  highlight_type: highlightTypeSchema.default('none'),
  is_sponsored: z.boolean().default(false),
  selection_reasons: z.array(z.string().min(1)).optional(),
  
  // Promoção - Novos campos
  promo_type: z.enum(['none','vitrine','destaque','vitrine_destaque']).default('none'),
  vitrine_package: z.string().optional(),
  vitrine_order_id: z.string().optional(),
  vitrine_notes: z.string().optional(),
  featured_reasons: z.array(z.string()).default([]),
  featured_note: z.string().optional(),
  featured_until: z.string().datetime().optional(),
  featured_weight: z.number().int().min(0).max(100).default(50),
  event_genres: z.array(z.string().min(1)).default([]),
  
  // Critérios de curadoria ROLÊ
  curatorial_criteria: curatorialCriteriaSchema,
  
  // Structure & Accessibility
  links: linksSchema,
  accessibility: accessibilitySchema,
  
  // SEO
  seo_title: z.string().max(60, "Título SEO muito longo").optional(),
  seo_description: z.string().max(160, "Descrição SEO muito longa").optional(),
  og_image_url: z.string().url().optional().or(z.literal('')),
  
  // Series & Organization
  series_id: z.string().uuid().optional(),
  edition_number: z.number().int().min(1).optional(),
  
  // Status & Publishing
  status: publicationStatusSchema.default('published'),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  slug: z.string().optional(),
  
  // Related Data (for cascade creation)
  partners: z.array(eventPartnerSchema).default([]),
  lineup_slots: z.array(lineupSlotSchema).default([]),
  performances: z.array(performanceSchema).default([]),
  visual_artists: z.array(visualArtistSchema).default([]),
  
  // Simple artists array (alternative to lineup_slots for simple events)
  artists: z.array(lineupSlotArtistSchema).default([]),
  
  // Metadata
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  
  // Legacy compatibility fields (deprecated - use new field names)
  start_utc: z.string().datetime().optional(),
  end_utc: z.string().datetime().optional(),
  artists_names: z.array(z.string()).default([]),
  visual_art: z.array(z.any()).default([]),
  published: z.boolean().optional()
}).superRefine((data, ctx) => {
  // Validações de promoção
  if (data.promo_type === 'vitrine' || data.promo_type === 'vitrine_destaque') {
    if (!data.vitrine_package) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione o pacote da vitrine',
        path: ['vitrine_package']
      });
    }
  }
  
  if (data.promo_type === 'destaque' || data.promo_type === 'vitrine_destaque') {
    if (!data.featured_reasons || data.featured_reasons.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Escolha pelo menos 1 motivo para o destaque',
        path: ['featured_reasons']
      });
    }
    
    if (!data.featured_note || data.featured_note.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nota editorial deve ter entre 10 e 140 caracteres',
        path: ['featured_note']
      });
    }
    
    if (data.featured_note && data.featured_note.length > 140) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nota editorial muito longa (máximo 140 caracteres)',
        path: ['featured_note']
      });
    }
  }

  // Cross-field validations
  
  // Date validations
  if (data.date_start && data.date_end) {
    const startDate = new Date(data.date_start);
    const endDate = new Date(data.date_end);
    
    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data de fim deve ser posterior à data de início",
        path: ['date_end']
      });
    }
  }
  
  if (data.date_start && data.doors_open_utc) {
    const startDate = new Date(data.date_start);
    const doorsDate = new Date(data.doors_open_utc);
    
    if (doorsDate > startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Abertura de portas deve ser anterior ou igual ao início do evento",
        path: ['doors_open_utc']
      });
    }
  }
  
  if (data.doors_open_utc && data.headliner_starts_utc) {
    const doorsDate = new Date(data.doors_open_utc);
    const headlinerDate = new Date(data.headliner_starts_utc);
    
    if (headlinerDate < doorsDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Início do headliner deve ser posterior à abertura de portas",
        path: ['headliner_starts_utc']
      });
    }
  }
  
  // Price validations
  if (data.price_min && data.price_max && data.price_max < data.price_min) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Preço máximo deve ser maior ou igual ao preço mínimo",
      path: ['price_max']
    });
  }
  
  // Ticketing validations
  if (data.ticketing?.min_price && data.ticketing?.max_price) {
    if (data.ticketing.max_price < data.ticketing.min_price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preço máximo do ingresso deve ser maior ou igual ao mínimo",
        path: ['ticketing', 'max_price']
      });
    }
  }
  
  // Consistency validations
  if (data.price_min && data.ticketing?.min_price) {
    if (data.ticketing.min_price < data.price_min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preço mínimo do ingresso deve ser consistente com o preço geral",
        path: ['ticketing', 'min_price']
      });
    }
  }
  
  // Sponsored validation
  if (data.highlight_type === 'vitrine' && !data.is_sponsored) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Eventos em vitrine devem ser patrocinados",
      path: ['is_sponsored']
    });
  }
  
  // Selection reasons validation for curatorial highlights
  if (data.highlight_type === 'curatorial' && (!data.selection_reasons || data.selection_reasons.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Motivos da escolha são obrigatórios para Destaque Curatorial",
      path: ['selection_reasons']
    });
  }
  
  // SEO validations
  if (data.seo_title && data.seo_title.length < 30) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Título SEO muito curto (mínimo 30 caracteres)",
      path: ['seo_title']
    });
  }
  
  if (data.seo_description && data.seo_description.length < 120) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Descrição SEO muito curta (mínimo 120 caracteres)",
      path: ['seo_description']
    });
  }
  
  // Series validations
  if (data.series_id && !data.edition_number) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Número da edição é obrigatório para eventos de série",
      path: ['edition_number']
    });
  }
  
  // Publishing validations
  if (data.status === 'published') {
    const requiredFields = ['title', 'description', 'date_start', 'city'];
    
    requiredFields.forEach(field => {
      if (!data[field as keyof typeof data]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${field} é obrigatório para publicação`,
          path: [field]
        });
      }
    });
  }
});

// Export types
export type EventFormData = z.infer<typeof eventSchema>;
export type EventPartner = z.infer<typeof eventPartnerSchema>;
export type LineupSlot = z.infer<typeof lineupSlotSchema>;
export type Performance = z.infer<typeof performanceSchema>;
export type VisualArtist = z.infer<typeof visualArtistSchema>;
export type TicketingData = z.infer<typeof ticketingSchema>;
export type LinksData = z.infer<typeof linksSchema>;
export type AccessibilityData = z.infer<typeof accessibilitySchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type CuratorialCriterion = z.infer<typeof curatorialCriterionSchema>;
export type CuratorialCriteria = z.infer<typeof curatorialCriteriaSchema>;

// Validation helpers
export function validateEventForPublish(data: EventFormData): string[] {
  const errors: string[] = [];
  
  // Required fields for publishing
  if (!data.title) errors.push("Título é obrigatório");
  if (!data.description) errors.push("Descrição é obrigatória");
  if (!data.date_start) errors.push("Data de início é obrigatória");
  if (!data.city) errors.push("Cidade é obrigatória");
  
  // Recommended fields
  if (!data.cover_url && !data.image_url) {
    errors.push("Imagem de capa é recomendada para publicação");
  }
  
  if (!data.summary) {
    errors.push("Resumo é recomendado para melhor SEO");
  }
  
  if (!data.seo_title) {
    errors.push("Título SEO é recomendado");
  }
  
  if (!data.seo_description) {
    errors.push("Descrição SEO é recomendada");
  }
  
  return errors;
}

// Default values helper
export function getEventDefaults(): Partial<EventFormData> {
  return {
    organizer_ids: [],
    status: 'published',
    visibility: 'public',
    highlight_type: 'none',
    is_sponsored: false,
    country: 'Brasil',
    currency: 'BRL',
    gallery: [],
    genres: [],
    tags: [],
    ticket_rules: [],
    partners: [],
    lineup_slots: [],
    performances: [],
    visual_artists: [],
    links: {},
    ticketing: {},
    curatorial_criteria: {},
    accessibility: {
      wheelchair_accessible: false,
      audio_description: false,
      sign_language: false,
      sensory_friendly: false
    }
  };
}