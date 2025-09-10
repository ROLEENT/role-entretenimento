import { z } from "zod";

// Enhanced organizer schema with dynamic fields based on type
export const organizerEnhancedSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic Info - Required
  name: z.string().min(2, "Nome é obrigatório").max(200, "Nome muito longo"),
  handle: z.string().min(3, "Handle deve ter pelo menos 3 caracteres").max(30, "Handle muito longo")
    .regex(/^[a-z0-9._-]+$/, "Handle deve conter apenas letras minúsculas, números, pontos, hífens e underscores"),
  slug: z.string().optional(), // Auto-generated from handle
  
  // Type - Required for dynamic fields
  type: z.enum(['coletivo', 'produtora', 'agencia', 'selo', 'independente', 'outro']),
  
  // Location
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().optional(),
  country: z.string().default('Brasil'),
  
  // Bio/Manifesto - Required
  manifesto: z.string().min(50, "Manifesto deve ter pelo menos 50 caracteres").max(1000, "Manifesto muito longo"),
  bio_short: z.string().min(20, "Bio curta deve ter pelo menos 20 caracteres").max(300, "Bio muito longa"),
  
  // Contact - Required
  contact: z.object({
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
    instagram: z.string().min(1, "Instagram é obrigatório"),
    website: z.string().url("URL inválida").optional().or(z.literal(''))
  }),
  
  // Media - Required main logo
  logo_url: z.string().url("URL do logo inválida"),
  logo_alt: z.string().min(5, "Descrição do logo é obrigatória"),
  cover_image_url: z.string().url("URL inválida").optional(),
  cover_image_alt: z.string().optional(),
  
  // Type-specific info
  // Coletivo specific
  collective_info: z.object({
    members_count: z.number().int().positive().optional(),
    founding_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    core_values: z.array(z.string()).default([]),
    areas_of_focus: z.array(z.string()).default([]),
    community_impact: z.string().optional()
  }).optional(),
  
  // Produtora specific
  production_info: z.object({
    cnpj: z.string().optional(),
    legal_name: z.string().optional(),
    founding_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    services: z.array(z.string()).default([]),
    specialties: z.array(z.string()).default([]),
    portfolio_highlights: z.array(z.string()).default([]),
    team_size: z.number().int().positive().optional()
  }).optional(),
  
  // Agência specific
  agency_info: z.object({
    cnpj: z.string().optional(),
    legal_name: z.string().optional(),
    roster_size: z.number().int().positive().optional(),
    territories: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    booking_focus: z.array(z.string()).default([]),
    commission_range: z.string().optional()
  }).optional(),
  
  // Selo specific  
  label_info: z.object({
    cnpj: z.string().optional(),
    legal_name: z.string().optional(),
    founding_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
    genres: z.array(z.string()).default([]),
    artists_count: z.number().int().positive().optional(),
    distribution_channels: z.array(z.string()).default([]),
    label_philosophy: z.string().optional()
  }).optional(),
  
  // Event Organization Focus
  event_focus: z.object({
    event_types: z.array(z.string()).default([]),
    target_audience: z.array(z.string()).default([]),
    frequency: z.enum(['semanal', 'quinzenal', 'mensal', 'bimestral', 'eventual']).optional(),
    capacity_range: z.enum(['até-100', '100-500', '500-1000', '1000-5000', '5000+']).optional(),
    budget_range: z.enum(['até-10k', '10k-50k', '50k-100k', '100k+']).optional()
  }).optional(),
  
  // Active Cities/Regions
  active_regions: z.array(z.string()).default([]),
  
  // Links Externos - Instagram obrigatório
  links: z.object({
    instagram: z.string().min(1, "Instagram é obrigatório"),
    facebook: z.string().url("URL inválida").optional().or(z.literal('')),
    website: z.string().url("URL inválida").optional().or(z.literal('')),
    youtube: z.string().url("URL inválida").optional().or(z.literal('')),
    spotify: z.string().url("URL inválida").optional().or(z.literal('')),
    soundcloud: z.string().url("URL inválida").optional().or(z.literal('')),
    linkedin: z.string().url("URL inválida").optional().or(z.literal('')),
    other: z.array(z.object({
      label: z.string(),
      url: z.string().url()
    })).default([])
  }),
  
  // Business Info (for legal entities)
  business_info: z.object({
    legal_name: z.string().optional(),
    cnpj: z.string().optional(),
    tax_id: z.string().optional(),
    registered_address: z.string().optional(),
    responsible_person: z.object({
      name: z.string().optional(),
      role: z.string().optional(),
      email: z.string().email("Email inválido").optional().or(z.literal('')),
      phone: z.string().optional()
    }).optional()
  }).optional(),
  
  // Financial Info (for booking/contracts)
  financial_info: z.object({
    bank_details: z.object({
      bank: z.string().optional(),
      agency: z.string().optional(),
      account: z.string().optional(),
      account_type: z.enum(['corrente', 'poupanca']).optional()
    }).optional(),
    pix_key: z.string().optional(),
    invoice_email: z.string().email("Email inválido").optional().or(z.literal(''))
  }).optional(),
  
  // Internal
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  priority: z.number().int().default(0),
  internal_notes: z.string().optional(),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type-specific validation
export const validateOrganizerByType = (data: z.infer<typeof organizerEnhancedSchema>) => {
  const errors: string[] = [];
  
  switch (data.type) {
    case 'produtora':
      if (!data.production_info?.services || data.production_info.services.length === 0) {
        errors.push("Serviços oferecidos são obrigatórios para produtoras");
      }
      break;
      
    case 'agencia':
      if (!data.agency_info?.services || data.agency_info.services.length === 0) {
        errors.push("Serviços oferecidos são obrigatórios para agências");
      }
      if (!data.agency_info?.territories || data.agency_info.territories.length === 0) {
        errors.push("Territórios de atuação são obrigatórios para agências");
      }
      break;
      
    case 'selo':
      if (!data.label_info?.genres || data.label_info.genres.length === 0) {
        errors.push("Gêneros musicais são obrigatórios para selos");
      }
      break;
      
    case 'coletivo':
      if (!data.collective_info?.areas_of_focus || data.collective_info.areas_of_focus.length === 0) {
        errors.push("Áreas de foco são obrigatórias para coletivos");
      }
      break;
  }
  
  return errors;
};

export type OrganizerEnhancedForm = z.infer<typeof organizerEnhancedSchema>;

// Options for selects
export const ORGANIZER_TYPES = [
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'produtora', label: 'Produtora' },
  { value: 'agencia', label: 'Agência' },
  { value: 'selo', label: 'Selo Musical' },
  { value: 'independente', label: 'Independente' },
  { value: 'outro', label: 'Outro' },
];

export const PRODUCTION_SERVICES = [
  'Organização de Eventos', 'Produção Musical', 'Booking de Artistas',
  'Marketing Cultural', 'Consultoria Artística', 'Gestão de Carreira',
  'Produção Audiovisual', 'Design Gráfico', 'Assessoria de Imprensa',
  'Licenciamento Musical', 'Distribuição Digital'
];

export const AGENCY_SERVICES = [
  'Booking Nacional', 'Booking Internacional', 'Gestão de Carreira',
  'Consultoria Artística', 'Negociação de Contratos', 'Planejamento de Tours',
  'Marketing Digital', 'Relações Públicas', 'Desenvolvimento Artístico'
];

export const EVENT_TYPES = [
  'Festas', 'Shows', 'Festivais', 'Peças de Teatro', 'Performances',
  'Feiras Culturais', 'Exposições', 'Workshops', 'Palestras',
  'Lançamentos', 'Apresentações', 'Competições'
];

export const TARGET_AUDIENCES = [
  'Jovens (18-25)', 'Adultos (26-35)', 'Público 35+', 'Famílias',
  'Comunidade LGBTQIA+', 'Comunidade Negra', 'Artistas', 'Profissionais da Música',
  'Estudantes', 'Turistas', 'Público Alternativo', 'Mainstream'
];