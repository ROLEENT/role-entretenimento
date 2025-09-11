import { z } from "zod";

// FASE 3: Schema corrigido - alinhado com colunas reais da tabela organizers
export const organizerEnhancedSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic Info - Required
  name: z.string().min(2, "Nome é obrigatório").max(200, "Nome muito longo"),
  slug: z.string().optional(), // Auto-generated from name
  
  // Type - Required for dynamic fields
  type: z.enum(['coletivo', 'produtora', 'agencia', 'pessoa-fisica', 'outro']),
  
  // Location
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().optional(),
  country: z.string().default('Brasil'),
  
  // Description - Manifesto/bio mais flexível
  manifesto: z.string().min(10, "Manifesto deve ter pelo menos 10 caracteres").max(1000, "Manifesto muito longo").optional(),
  bio_short: z.string().min(10, "Bio deve ter pelo menos 10 caracteres").max(500, "Bio muito longa").optional(),
  about: z.string().max(3000, "Sobre muito extenso").optional(),
  
  // Contact - Email obrigatório, outros opcionais
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal('')),
  
  // Media - Logo opcional
  logo_url: z.string().url("URL da logo inválida").optional(),
  logo_alt: z.string().optional(),
  cover_url: z.string().url("URL inválida").optional(),
  cover_alt: z.string().optional(),
  gallery: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    caption: z.string().optional()
  })).default([]),
  
  // Links Externos
  links: z.object({
    instagram: z.string().min(1, "Instagram é obrigatório"),
    facebook: z.string().url("URL inválida").optional().or(z.literal('')),
    linkedin: z.string().url("URL inválida").optional().or(z.literal('')),
    youtube: z.string().url("URL inválida").optional().or(z.literal('')),
    website: z.string().url("URL inválida").optional().or(z.literal('')),
    other: z.array(z.object({
      label: z.string(),
      url: z.string().url()
    })).default([])
  }),
  
  // Type-specific fields
  // Coletivo specific
  collective_members: z.number().int().positive().optional(),
  collective_philosophy: z.string().optional(),
  collective_areas: z.array(z.string()).default([]), // Música, Arte, Teatro, etc.
  
  // Produtora specific
  company_cnpj: z.string().optional(),
  company_size: z.enum(['pequena', 'media', 'grande']).optional(),
  specialties: z.array(z.string()).default([]), // Eventos, Shows, Festivais
  portfolio_highlights: z.array(z.string()).default([]),
  
  // Agência specific
  roster_size: z.number().int().positive().optional(),
  territories: z.array(z.string()).default([]), // SP, RJ, Brasil, Internacional
  services: z.array(z.string()).default([]), // Booking, Management, Marketing
  commission_structure: z.string().optional(),
  
  // Pessoa Física specific
  professional_experience: z.string().optional(),
  education_background: z.string().optional(),
  certifications: z.array(z.string()).default([]),
  
  // Business Info
  business_info: z.object({
    legal_name: z.string().optional(),
    tax_id: z.string().optional(), // CPF ou CNPJ
    address: z.string().optional(),
    legal_representative: z.string().optional(),
  }).optional(),
  
  // Financial Info
  payment_info: z.object({
    pix_key: z.string().optional(),
    bank_account: z.string().optional(),
    preferred_payment_method: z.enum(['pix', 'transferencia', 'boleto', 'dinheiro']).optional(),
  }).optional(),
  
  // Professional Details
  areas_of_work: z.array(z.string()).default([]), // Música, Teatro, Arte Visual, etc.
  target_audience: z.array(z.string()).default([]), // Jovens, Famílias, Artistas, etc.
  event_types: z.array(z.string()).default([]), // Festas, Shows, Teatros, etc.
  
  // Booking Contact
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

export type OrganizerEnhancedForm = z.infer<typeof organizerEnhancedSchema>;

// Options for selects
export const ORGANIZER_TYPES = [
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'produtora', label: 'Produtora' },
  { value: 'agencia', label: 'Agência' },
  { value: 'pessoa-fisica', label: 'Pessoa Física' },
  { value: 'outro', label: 'Outro' },
];

export const COLLECTIVE_AREAS = [
  'Música Eletrônica', 'Arte Visual', 'Teatro', 'Dança', 'Performance',
  'Literatura', 'Cinema', 'Fotografia', 'Design', 'Ativismo Cultural'
];

export const PRODUCTION_SPECIALTIES = [
  'Eventos Musicais', 'Shows', 'Festivais', 'Teatro', 'Arte Visual',
  'Eventos Corporativos', 'Casamentos', 'Formaturas', 'Marketing Cultural'
];

export const AGENCY_SERVICES = [
  'Booking', 'Management', 'Marketing', 'Assessoria de Imprensa',
  'Produção', 'Distribuição', 'Publishing', 'Consultoria'
];

export const WORK_AREAS = [
  'Música', 'Teatro', 'Dança', 'Arte Visual', 'Cinema', 'Literatura',
  'Performance', 'Cultura Popular', 'Eventos Corporativos'
];

export const TARGET_AUDIENCES = [
  'Jovens (18-25)', 'Adultos (26-40)', 'Famílias', 'Terceira Idade',
  'Artistas', 'Empresários', 'Estudantes', 'Comunidade LGBTQ+', 'Todos os Públicos'
];

export const EVENT_TYPES = [
  'Festas', 'Shows', 'Teatros', 'Performances', 'Exposições',
  'Workshops', 'Palestras', 'Festivais', 'Feiras', 'Lançamentos'
];