import { z } from 'zod';

// Esquema base com campos comuns
const baseAgentSchema = z.object({
  agent_type: z.enum(['artist', 'venue', 'organizer'], {
    errorMap: () => ({ message: 'Tipo de agente é obrigatório' })
  }),
  name: z.string().min(2, 'Nome obrigatório').max(200, 'Nome muito longo'),
  slug: z.string().min(2, 'Slug obrigatório'),
  status: z.enum(['active', 'inactive']).default('active'),
});

// Esquema específico para venue (validações leves)
const venueSchema = baseAgentSchema.extend({
  agent_type: z.literal('venue'),
  city: z.string().optional(),
  instagram: z.string().optional().transform((val) => val ? val.replace(/^@+/, '') : val),
  whatsapp: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  website: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional()
    .or(z.literal('')),
  bio_short: z.string().optional(),
  venue_type: z.enum(['bar', 'clube', 'casa_de_shows', 'teatro', 'galeria', 'espaco_cultural', 'restaurante']).optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  capacity: z.coerce.number().int().positive('Capacidade deve ser positiva').optional(),
  rules: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Esquema completo para artista e organizador (validações completas)
const fullAgentSchema = z.object({
  agent_type: z.enum(['artist', 'venue', 'organizer'], {
    errorMap: () => ({ message: 'Tipo de agente é obrigatório' })
  }),
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  instagram: z.string()
    .min(1, 'Instagram é obrigatório')
    .transform((val) => val.replace(/^@+/, '')),
  whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  email: z.string().email('Email inválido'),
  website: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional()
    .or(z.literal('')),
  bio_short: z.string().min(1, 'Bio curta é obrigatória').max(500, 'Bio curta muito longa'),
  status: z.enum(['active', 'inactive']).default('active'),

  // Campos específicos para artista
  artist_subtype: z.enum(['banda', 'dj', 'solo', 'drag']).optional(),
  spotify_url: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional()
    .or(z.literal('')),
  soundcloud_url: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional()
    .or(z.literal('')),
  youtube_url: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional()
    .or(z.literal('')),
  beatport_url: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional()
    .or(z.literal('')),
  profile_image_url: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional(),
  presskit_url: z.string()
    .refine((val) => !val || val.startsWith('https://'), 'URL deve começar com https://')
    .optional()
    .or(z.literal('')),

  // Campos específicos para local
  venue_type: z.enum(['bar', 'clube', 'casa_de_shows', 'teatro', 'galeria', 'espaco_cultural', 'restaurante']).optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  capacity: z.number().min(1, 'Capacidade deve ser maior que 0').optional(),
  rules: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),

  // Campos específicos para organizador
  organizer_subtype: z.enum(['organizador', 'produtora', 'coletivo', 'selo']).optional(),
  booking_email: z.string().email('Email inválido').optional().or(z.literal('')),
  booking_whatsapp: z.string().optional(),
}).refine((data) => {
  // Validações condicionais baseadas no tipo (apenas para artist e organizer)
  if (data.agent_type === 'artist') {
    return !!(data.artist_subtype && data.profile_image_url);
  }
  if (data.agent_type === 'organizer') {
    return !!data.organizer_subtype;
  }
  // Venue não tem validações condicionais obrigatórias
  return true;
}, {
  message: "Campos obrigatórios para o tipo selecionado estão faltando",
  path: ["agent_type"]
});

// Schema dinâmico baseado no tipo
export const getAgentSchema = (agentType?: string) => {
  if (agentType === 'venue') {
    return venueSchema;
  }
  return fullAgentSchema;
};

// Schema padrão (mantém compatibilidade)
export const agentSchema = fullAgentSchema;

export type AgentFormData = z.infer<typeof agentSchema>;

export const AGENT_TYPES = [
  { value: 'artist', label: 'Artista' },
  { value: 'venue', label: 'Local' },
  { value: 'organizer', label: 'Organizador' },
];

export const ARTIST_SUBTYPES = [
  { value: 'banda', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'solo', label: 'Solo' },
  { value: 'drag', label: 'Drag' },
];

export const VENUE_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'clube', label: 'Clube' },
  { value: 'casa_de_shows', label: 'Casa de Shows' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'galeria', label: 'Galeria' },
  { value: 'espaco_cultural', label: 'Espaço Cultural' },
  { value: 'restaurante', label: 'Restaurante' },
];

export const ORGANIZER_SUBTYPES = [
  { value: 'organizador', label: 'Organizador' },
  { value: 'produtora', label: 'Produtora' },
  { value: 'coletivo', label: 'Coletivo' },
  { value: 'selo', label: 'Selo' },
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 
  'Porto Alegre', 'Curitiba', 'Florianópolis', 'Salvador',
  'Recife', 'Fortaleza', 'Goiânia', 'Manaus'
];