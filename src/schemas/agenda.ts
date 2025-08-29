import { z } from 'zod';

// City options
export const CITY_OPTIONS = [
  { value: 'porto-alegre', label: 'Porto Alegre' },
  { value: 'sao-paulo', label: 'São Paulo' },
  { value: 'rio-de-janeiro', label: 'Rio de Janeiro' },
  { value: 'belo-horizonte', label: 'Belo Horizonte' },
  { value: 'brasilia', label: 'Brasília' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'salvador', label: 'Salvador' },
  { value: 'recife', label: 'Recife' },
  { value: 'fortaleza', label: 'Fortaleza' }
] as const;

// Visibility options
export const VISIBILITY_OPTIONS = [
  { value: 'curadoria', label: 'Curadoria' },
  { value: 'vitrine', label: 'Vitrine' }
] as const;

// Status options
export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' }
] as const;

// Ticket status options
export const TICKET_STATUS_OPTIONS = [
  { value: 'free', label: 'Gratuito' },
  { value: 'paid', label: 'Pago' },
  { value: 'sold_out', label: 'Esgotado' },
  { value: 'invite_only', label: 'Apenas por convite' }
] as const;

// Type options
export const TYPE_OPTIONS = [
  { value: 'show', label: 'Show' },
  { value: 'festa', label: 'Festa' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'exposicao', label: 'Exposição' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'palestra', label: 'Palestra' },
  { value: 'cinema', label: 'Cinema' },
  { value: 'esporte', label: 'Esporte' },
  { value: 'gastronomia', label: 'Gastronomia' },
  { value: 'outros', label: 'Outros' }
] as const;

// Age rating options
export const AGE_RATING_OPTIONS = [
  { value: 'livre', label: 'Livre' },
  { value: '10', label: '10 anos' },
  { value: '12', label: '12 anos' },
  { value: '14', label: '14 anos' },
  { value: '16', label: '16 anos' },
  { value: '18', label: '18 anos' }
] as const;

// Accessibility options
export const ACCESSIBILITY_OPTIONS = [
  { value: 'wheelchair', label: 'Acessível para cadeirantes' },
  { value: 'interpreter', label: 'Intérprete de Libras' },
  { value: 'subtitle', label: 'Legendas' },
  { value: 'braille', label: 'Material em Braille' },
  { value: 'low_vision', label: 'Apoio para baixa visão' },
  { value: 'hearing_loop', label: 'Loop auditivo' }
] as const;

// Preprocessor para converter strings vazias e null em undefined
const preprocessEmptyString = (val: any) => {
  if (val === '' || val === null) return undefined;
  return val;
};

// Schema base para agenda_itens
const AgendaBaseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  slug: z.string().min(1, 'Slug é obrigatório').max(200, 'Slug muito longo'),
  subtitle: z.preprocess(preprocessEmptyString, z.string().max(300, 'Subtítulo muito longo').optional()),
  city: z.preprocess(preprocessEmptyString, z.string().optional()),
  summary: z.preprocess(preprocessEmptyString, z.string().max(500, 'Resumo muito longo').optional()),
  cover_url: z.preprocess(preprocessEmptyString, z.string().url('URL da capa inválida').optional()),
  alt_text: z.preprocess(preprocessEmptyString, z.string().max(200, 'Texto alternativo muito longo').optional()),
  start_at: z.preprocess(preprocessEmptyString, z.string().datetime('Data de início inválida').optional()),
  end_at: z.preprocess(preprocessEmptyString, z.string().datetime('Data de fim inválida').optional()),
  ticket_url: z.preprocess(preprocessEmptyString, z.string().url('URL de ingressos inválida').optional()),
  source_url: z.preprocess(preprocessEmptyString, z.string().url('URL de origem inválida').optional()),
  venue_id: z.preprocess(preprocessEmptyString, z.string().uuid('ID do local inválido').optional()),
  organizer_id: z.preprocess(preprocessEmptyString, z.string().uuid('ID do organizador inválido').optional()),
  event_id: z.preprocess(preprocessEmptyString, z.string().uuid('ID do evento inválido').optional()),
  status: z.enum(['draft', 'published']).default('draft'),
  visibility_type: z.enum(['curadoria', 'vitrine']).default('curadoria'),
  priority: z.number().int().min(0).max(10).default(0),
  patrocinado: z.boolean().default(false),
  noindex: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  type: z.preprocess(preprocessEmptyString, z.string().optional()),
  anunciante: z.preprocess(preprocessEmptyString, z.string().optional()),
  cupom: z.preprocess(preprocessEmptyString, z.string().optional()),
  meta_title: z.preprocess(preprocessEmptyString, z.string().max(60, 'Meta título muito longo').optional()),
  meta_description: z.preprocess(preprocessEmptyString, z.string().max(160, 'Meta descrição muito longa').optional()),
  canonical_url: z.preprocess(preprocessEmptyString, z.string().url('URL canônica inválida').optional()),
  meta_image_url: z.preprocess(preprocessEmptyString, z.string().url('URL da meta imagem inválida').optional()),
  share_text: z.preprocess(preprocessEmptyString, z.string().max(280, 'Texto de compartilhamento muito longo').optional()),
  editorial_notes: z.preprocess(preprocessEmptyString, z.string().optional()),
  location_name: z.preprocess(preprocessEmptyString, z.string().optional()),
  address: z.preprocess(preprocessEmptyString, z.string().optional()),
  neighborhood: z.preprocess(preprocessEmptyString, z.string().optional()),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price_min: z.number().min(0, 'Preço mínimo deve ser positivo').optional(),
  price_max: z.number().min(0, 'Preço máximo deve ser positivo').optional(),
  currency: z.string().default('BRL'),
  ticket_status: z.preprocess(preprocessEmptyString, z.enum(['free', 'paid', 'sold_out', 'invite_only']).optional()),
  age_rating: z.preprocess(preprocessEmptyString, z.enum(['livre', '10', '12', '14', '16', '18']).optional()),
  accessibility: z.record(z.boolean()).default({}),
  focal_point_x: z.number().min(0).max(1).optional(),
  focal_point_y: z.number().min(0).max(1).optional(),
  publish_at: z.preprocess(preprocessEmptyString, z.string().datetime().optional()),
  unpublish_at: z.preprocess(preprocessEmptyString, z.string().datetime().optional()),
  preview_token: z.preprocess(preprocessEmptyString, z.string().optional()),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().optional(),
});

// Schema para ocorrências extras
const OccurrenceSchema = z.object({
  id: z.string().uuid().optional(),
  agenda_id: z.string().uuid().optional(),
  start_at: z.string().datetime('Data de início obrigatória'),
  end_at: z.string().datetime('Data de fim obrigatória'),
  created_at: z.string().datetime().optional(),
}).refine((data) => {
  if (!data.start_at || !data.end_at) return true;
  const start = new Date(data.start_at);
  const end = new Date(data.end_at);
  const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  return diffMinutes >= 15;
}, {
  message: 'A duração mínima deve ser de 15 minutos',
  path: ['end_at'],
});

// Schema para tiers de ingresso
const TicketTierSchema = z.object({
  id: z.string().uuid().optional(),
  agenda_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nome do tier é obrigatório'),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  currency: z.string().default('BRL'),
  link: z.preprocess(preprocessEmptyString, z.string().url('Link inválido').optional()),
  available: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
});

// Schema para mídia
const MediaSchema = z.object({
  id: z.string().uuid().optional(),
  agenda_id: z.string().uuid().optional(),
  url: z.string().url('URL da mídia é obrigatória'),
  alt_text: z.preprocess(preprocessEmptyString, z.string().max(200, 'Texto alternativo muito longo').optional()),
  kind: z.enum(['image', 'video']).default('image'),
  position: z.number().int().min(0, 'Posição deve ser um número inteiro positivo').default(0),
});

// Schema para rascunho (apenas title e slug obrigatórios)
export const AgendaDraftSchema = z.object({
  item: AgendaBaseSchema.partial().extend({
    title: z.string().min(1, 'Título é obrigatório'),
    slug: z.string().min(1, 'Slug é obrigatório'),
  }),
  occurrences: z.array(OccurrenceSchema).optional(),
  ticket_tiers: z.array(TicketTierSchema).optional(),
  media: z.array(MediaSchema).optional(),
});

// Schema para publicação (campos obrigatórios + validações extras)
export const AgendaPublishSchema = z.object({
  item: AgendaBaseSchema.extend({
    title: z.string().min(1, 'Título é obrigatório para publicação'),
    slug: z.string().min(1, 'Slug é obrigatório para publicação'),
    city: z.string().min(1, 'Cidade é obrigatória para publicação'),
    start_at: z.string().datetime('Data de início é obrigatória para publicação'),
    end_at: z.string().datetime('Data de fim é obrigatória para publicação'),
    cover_url: z.string().url('Capa é obrigatória para publicação'),
    alt_text: z.string().min(1, 'Texto alternativo da capa é obrigatório para publicação'),
    summary: z.string().min(10, 'Resumo de pelo menos 10 caracteres é obrigatório para publicação'),
  }).refine((data) => {
    if (!data.start_at || !data.end_at) return true;
    const start = new Date(data.start_at);
    const end = new Date(data.end_at);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMinutes >= 15;
  }, {
    message: 'A duração mínima deve ser de 15 minutos',
    path: ['end_at'],
  }).refine((data) => {
    // Validar preços se ambos estão definidos
    if (data.price_min !== undefined && data.price_max !== undefined) {
      return data.price_max >= data.price_min;
    }
    return true;
  }, {
    message: 'Preço máximo deve ser maior ou igual ao preço mínimo',
    path: ['price_max'],
  }),
  occurrences: z.array(OccurrenceSchema).optional(),
  ticket_tiers: z.array(TicketTierSchema).optional(),
  media: z.array(MediaSchema).optional(),
});

// Schema completo para qualquer operação
export const AgendaSchema = AgendaBaseSchema;

// Tipos TypeScript
export type AgendaItem = z.infer<typeof AgendaBaseSchema>;
export type AgendaOccurrence = z.infer<typeof OccurrenceSchema>;
export type AgendaTicketTier = z.infer<typeof TicketTierSchema>;
export type AgendaMedia = z.infer<typeof MediaSchema>;
export type AgendaDraftData = z.infer<typeof AgendaDraftSchema>;
export type AgendaPublishData = z.infer<typeof AgendaPublishSchema>;

// Helper para sanitizar dados para salvar no banco
export function sanitizeForSave(data: any): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.map(sanitizeForSave);
  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.trim() === '') {
        result[key] = null;
      } else {
        result[key] = sanitizeForSave(value);
      }
    }
    return result;
  }
  return data;
}

// Helper para preparar dados do formulário para envio
export function prepareFormData(formData: any): AgendaDraftData {
  return {
    item: sanitizeForSave(formData.item || {}),
    occurrences: sanitizeForSave(formData.occurrences || []),
    ticket_tiers: sanitizeForSave(formData.ticket_tiers || []),
    media: sanitizeForSave(formData.media || []),
  };
}

// Helper para validar se pode publicar
export function canPublish(data: any): { valid: boolean; errors: string[] } {
  try {
    AgendaPublishSchema.parse(data);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return { valid: false, errors: ['Erro de validação desconhecido'] };
  }
}

// Validações específicas para URLs
export const validateTicketUrl = (url: string | null | undefined): boolean => {
  if (!url) return true;
  return url.startsWith('http://') || url.startsWith('https://');
};

export const validateSourceUrl = (url: string | null | undefined): boolean => {
  if (!url) return true;
  return url.startsWith('http://') || url.startsWith('https://');
};

// Schema específico para validação de slug único
export const SlugCheckSchema = z.object({
  slug: z.string().min(1, 'Slug é obrigatório').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  excludeId: z.string().uuid().optional(),
});

export type SlugCheckData = z.infer<typeof SlugCheckSchema>;