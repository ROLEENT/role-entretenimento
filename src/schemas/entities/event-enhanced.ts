import { z } from "zod";

// Enhanced event schema with dynamic fields based on type
export const eventEnhancedSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic Info - Required
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200, "Título muito longo"),
  slug: z.string().optional(), // Auto-generated from title
  
  // Event Type - Required for dynamic fields
  type: z.enum(['festa', 'show', 'teatro', 'festival', 'performance', 'feira', 'exposicao', 'workshop', 'outro']),
  
  // Date & Time - Required
  datetime: z.object({
    start: z.string().datetime("Data de início é obrigatória"),
    end: z.string().datetime().optional(),
    doors_open: z.string().datetime().optional(),
    show_start: z.string().datetime().optional(),
    timezone: z.string().default('America/Sao_Paulo')
  }),
  
  // Location - Required
  location: z.object({
    venue_id: z.string().uuid().optional(),
    venue_name: z.string().min(1, "Nome do local é obrigatório"),
    address: z.string().min(5, "Endereço é obrigatório"),
    city: z.string().min(2, "Cidade é obrigatória"),
    state: z.string().optional(),
    country: z.string().default('Brasil'),
    neighborhood: z.string().optional(),
    additional_info: z.string().optional()
  }),
  
  // Description - Required
  description: z.object({
    summary: z.string().min(50, "Resumo deve ter pelo menos 50 caracteres").max(500, "Resumo muito longo"),
    full: z.string().min(100, "Descrição completa deve ter pelo menos 100 caracteres").max(5000, "Descrição muito longa"),
    highlights: z.array(z.string()).default([])
  }),
  
  // Visual Content - Required cover image
  media: z.object({
    cover_image: z.object({
      url: z.string().url("URL da capa é obrigatória"),
      alt: z.string().min(10, "Descrição da capa é obrigatória"),
      credit: z.string().optional()
    }),
    gallery: z.array(z.object({
      url: z.string().url(),
      alt: z.string(),
      caption: z.string().optional(),
      credit: z.string().optional()
    })).default([]),
    video_url: z.string().url("URL inválida").optional().or(z.literal(''))
  }),
  
  // Organization - Required
  organization: z.object({
    organizer_id: z.string().uuid().optional(),
    organizer_name: z.string().min(1, "Nome do organizador é obrigatório"),
    additional_organizers: z.array(z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      role: z.string().optional()
    })).default([]),
    contact: z.object({
      email: z.string().email("Email inválido").optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional()
    }).optional()
  }),
  
  // Type-specific content
  // Festa/Show specific
  lineup: z.object({
    artists: z.array(z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      role: z.enum(['headliner', 'support', 'dj', 'performer']).default('performer'),
      start_time: z.string().datetime().optional(),
      duration_minutes: z.number().int().positive().optional(),
      stage: z.string().optional()
    })).default([]),
    stages: z.array(z.object({
      name: z.string(),
      description: z.string().optional()
    })).default([])
  }).optional(),
  
  // Teatro specific
  theater_info: z.object({
    cast: z.array(z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      character: z.string().optional(),
      role: z.enum(['protagonista', 'coadjuvante', 'diretor', 'producao']).default('coadjuvante')
    })).default([]),
    director: z.string().optional(),
    playwright: z.string().optional(),
    genre: z.string().optional(),
    duration_minutes: z.number().int().positive().optional(),
    age_rating: z.enum(['livre', '10+', '12+', '14+', '16+', '18+']).default('livre'),
    synopsis: z.string().optional()
  }).optional(),
  
  // Performance specific
  performance_info: z.object({
    performers: z.array(z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      type: z.string(),
      description: z.string().optional()
    })).default([]),
    performance_type: z.array(z.string()).default([]),
    duration_minutes: z.number().int().positive().optional(),
    interactive: z.boolean().default(false)
  }).optional(),
  
  // Feira/Exposição specific
  exhibition_info: z.object({
    exhibitors: z.array(z.object({
      id: z.string().uuid().optional(),
      name: z.string(),
      type: z.string(),
      description: z.string().optional(),
      booth_number: z.string().optional()
    })).default([]),
    categories: z.array(z.string()).default([]),
    entry_fee: z.boolean().default(false)
  }).optional(),
  
  // Festival specific
  festival_info: z.object({
    days: z.array(z.object({
      date: z.string().datetime(),
      lineup: z.array(z.object({
        id: z.string().uuid().optional(),
        name: z.string(),
        start_time: z.string().datetime().optional(),
        stage: z.string().optional()
      }))
    })).default([]),
    stages: z.array(z.object({
      name: z.string(),
      capacity: z.number().int().positive().optional(),
      description: z.string().optional()
    })).default([])
  }).optional(),
  
  // Ticketing
  ticketing: z.object({
    is_free: z.boolean().default(false),
    tickets: z.array(z.object({
      name: z.string(),
      price: z.number().min(0),
      currency: z.string().default('BRL'),
      available: z.boolean().default(true),
      url: z.string().url().optional()
    })).default([]),
    main_ticket_url: z.string().url("URL inválida").optional().or(z.literal('')),
    ticket_info: z.string().optional()
  }),
  
  // Classification
  genres: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  age_rating: z.enum(['livre', '10+', '12+', '14+', '16+', '18+']).default('livre'),
  
  // Social Links
  links: z.object({
    website: z.string().url("URL inválida").optional().or(z.literal('')),
    facebook: z.string().url("URL inválida").optional().or(z.literal('')),
    instagram: z.string().url("URL inválida").optional().or(z.literal('')),
    youtube: z.string().url("URL inválida").optional().or(z.literal('')),
    other: z.array(z.object({
      label: z.string(),
      url: z.string().url()
    })).default([])
  }).optional(),
  
  // Accessibility & Policies
  accessibility: z.object({
    wheelchair_accessible: z.boolean().default(false),
    sign_language: z.boolean().default(false),
    audio_description: z.boolean().default(false),
    notes: z.string().optional()
  }).optional(),
  
  policies: z.object({
    photography: z.enum(['permitido', 'restrito', 'proibido']).default('permitido'),
    recording: z.enum(['permitido', 'restrito', 'proibido']).default('restrito'),
    outside_food: z.boolean().default(false),
    outside_drinks: z.boolean().default(false),
    dress_code: z.string().optional(),
    special_rules: z.array(z.string()).default([])
  }).optional(),
  
  // SEO
  seo: z.object({
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).default([])
  }).optional(),
  
  // Status
  status: z.enum(['draft', 'scheduled', 'published', 'cancelled', 'completed']).default('draft'),
  visibility: z.enum(['public', 'private', 'unlisted']).default('public'),
  
  // Internal
  internal_notes: z.string().optional(),
  featured: z.boolean().default(false),
  sponsored: z.boolean().default(false),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  published_at: z.string().datetime().optional(),
});

// Type-specific validation
export const validateEventByType = (data: z.infer<typeof eventEnhancedSchema>) => {
  const errors: string[] = [];
  
  switch (data.type) {
    case 'festa':
    case 'show':
      if (!data.lineup?.artists || data.lineup.artists.length === 0) {
        errors.push("Pelo menos um artista deve estar no lineup");
      }
      break;
      
    case 'teatro':
      if (!data.theater_info?.cast || data.theater_info.cast.length === 0) {
        errors.push("Elenco é obrigatório para peças de teatro");
      }
      if (!data.theater_info?.duration_minutes) {
        errors.push("Duração é obrigatória para peças de teatro");
      }
      break;
      
    case 'performance':
      if (!data.performance_info?.performers || data.performance_info.performers.length === 0) {
        errors.push("Pelo menos um performer deve ser especificado");
      }
      break;
      
    case 'feira':
    case 'exposicao':
      if (!data.exhibition_info?.exhibitors || data.exhibition_info.exhibitors.length === 0) {
        errors.push("Pelo menos um expositor deve ser especificado");
      }
      break;
      
    case 'festival':
      if (!data.festival_info?.days || data.festival_info.days.length === 0) {
        errors.push("Pelo menos um dia de programação deve ser especificado");
      }
      break;
  }
  
  // General validations
  if (data.datetime.end && new Date(data.datetime.end) <= new Date(data.datetime.start)) {
    errors.push("Data de fim deve ser posterior à data de início");
  }
  
  if (!data.ticketing.is_free && (!data.ticketing.tickets || data.ticketing.tickets.length === 0)) {
    errors.push("Informações de ingresso são obrigatórias para eventos pagos");
  }
  
  return errors;
};

export type EventEnhancedForm = z.infer<typeof eventEnhancedSchema>;

// Options for selects
export const EVENT_TYPES = [
  { value: 'festa', label: 'Festa' },
  { value: 'show', label: 'Show' },
  { value: 'teatro', label: 'Peça de Teatro' },
  { value: 'festival', label: 'Festival' },
  { value: 'performance', label: 'Performance' },
  { value: 'feira', label: 'Feira Cultural' },
  { value: 'exposicao', label: 'Exposição' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'outro', label: 'Outro' },
];

export const ARTIST_ROLES = [
  { value: 'headliner', label: 'Headliner' },
  { value: 'support', label: 'Abertura' },
  { value: 'dj', label: 'DJ' },
  { value: 'performer', label: 'Performer' },
];

export const THEATER_ROLES = [
  { value: 'protagonista', label: 'Protagonista' },
  { value: 'coadjuvante', label: 'Coadjuvante' },
  { value: 'diretor', label: 'Diretor(a)' },
  { value: 'producao', label: 'Produção' },
];

export const AGE_RATINGS = [
  { value: 'livre', label: 'Livre' },
  { value: '10+', label: '10 anos' },
  { value: '12+', label: '12 anos' },
  { value: '14+', label: '14 anos' },
  { value: '16+', label: '16 anos' },
  { value: '18+', label: '18 anos' },
];