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

// Types
type Visibility = 'curadoria' | 'vitrine';
type Status = 'draft' | 'published';

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

// Ticket status enum and options
export const TicketStatusEnum = z.enum(['free', 'paid', 'sold_out', 'invite_only']);
export type TicketStatus = z.infer<typeof TicketStatusEnum>;

export const TICKET_STATUS_OPTIONS = [
  { value: 'free', label: 'Gratuito' },
  { value: 'paid', label: 'Pago' },
  { value: 'sold_out', label: 'Esgotado' },
  { value: 'invite_only', label: 'Só convidados' }
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

// Schema base para AgendaForm
const AgendaBaseFormSchema = z.object({
  id: z.preprocess(preprocessEmptyString, z.string().uuid().optional()),
  visibility_type: z.enum(['curadoria', 'vitrine'] as const).default('curadoria'),
  status: z.enum(['draft', 'published'] as const).default('draft'),
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  subtitle: z.preprocess(preprocessEmptyString, z.string().optional()),
  summary: z.preprocess(preprocessEmptyString, z.string().optional()),
  city: z.string().min(2, 'Informe a cidade').transform(val => val?.trim().replace(/\s+/g, ' ')),
  start_at: z.preprocess(preprocessEmptyString, z.string().datetime('Data de início inválida').optional()),
  end_at: z.preprocess(preprocessEmptyString, z.string().datetime('Data de fim inválida').optional()),
  cover_url: z.preprocess(preprocessEmptyString, z.string().url('URL da capa inválida').optional()),
  alt_text: z.preprocess(preprocessEmptyString, z.string().optional()),
  ticket_url: z.preprocess(preprocessEmptyString, z.string().refine(
    (url) => !url || url.startsWith('http://') || url.startsWith('https://'),
    'URL deve começar com http:// ou https://'
  ).optional()),
  tags: z.array(z.string().min(1, 'Tag não pode estar vazia').max(24, 'Tag muito longa')).max(6, 'Máximo 6 tags').default([]),
  type: z.preprocess(preprocessEmptyString, z.string().optional()),
  patrocinado: z.boolean().default(false),
  anunciante: z.preprocess(preprocessEmptyString, z.string().optional()),
  cupom: z.preprocess(preprocessEmptyString, z.string().optional()),
  priority: z.number().int().min(0).default(0),
  meta_title: z.preprocess(preprocessEmptyString, z.string().max(60, 'Meta título deve ter no máximo 60 caracteres').optional()),
  meta_description: z.preprocess(preprocessEmptyString, z.string().max(160, 'Meta descrição deve ter no máximo 160 caracteres').optional()),
  noindex: z.boolean().default(false),
  publish_at: z.preprocess(preprocessEmptyString, z.string().datetime().optional()),
  unpublish_at: z.preprocess(preprocessEmptyString, z.string().datetime().optional()),
  focal_point_x: z.number().min(0, 'Deve estar entre 0 e 1').max(1, 'Deve estar entre 0 e 1').optional(),
  focal_point_y: z.number().min(0, 'Deve estar entre 0 e 1').max(1, 'Deve estar entre 0 e 1').optional(),
  
  // Novo campo artists_names
  artists_names: z.array(
    z.string()
      .min(1, 'Nome do artista não pode estar vazio')
      .max(80, 'Nome do artista muito longo')
      .transform(s => s.trim())
      .refine(s => s.length > 0, 'Nome do artista não pode estar vazio após trim')
  ).max(12, 'Máximo 12 artistas').default([]),

  // Relacionamentos opcionais
  event_id: z.preprocess(preprocessEmptyString, z.string().uuid().optional()),
  organizer_id: z.preprocess(preprocessEmptyString, z.string().uuid().optional()),
  venue_id: z.preprocess(preprocessEmptyString, z.string().uuid().optional()),
});

// Schema principal com validação de duração
export const AgendaFormSchema = AgendaBaseFormSchema.refine((data) => {
  // Validação de duração mínima: end_at > start_at + 15min
  if (data.start_at && data.end_at) {
    const start = new Date(data.start_at);
    const end = new Date(data.end_at);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMinutes >= 15;
  }
  return true;
}, {
  message: 'A data de fim deve ser pelo menos 15 minutos após o início',
  path: ['end_at'],
});

// Schema para publicação com validações adicionais
export const AgendaPublishFormSchema = AgendaFormSchema.refine((data) => {
  return data.title && data.slug && data.city && data.start_at && data.end_at && data.cover_url && data.alt_text;
}, {
  message: 'Para publicar é necessário: título, slug, cidade, datas de início e fim, capa e texto alternativo',
});

// Compatibilidade com código existente
const AgendaBaseSchema = AgendaBaseFormSchema;

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
  item: AgendaBaseFormSchema.extend({
    title: z.string().min(1, 'Título é obrigatório'),
    slug: z.string().min(1, 'Slug é obrigatório'),
  }),
  occurrences: z.array(OccurrenceSchema).optional(),
  ticket_tiers: z.array(TicketTierSchema).optional(),
  media: z.array(MediaSchema).optional(),
});

// Schema para publicação (campos obrigatórios + validações extras)
export const AgendaPublishSchema = AgendaDraftSchema.superRefine((data, ctx) => {
  const item = data.item;
  
  // Campos obrigatórios para publicação
  if (!item.city) {
    ctx.addIssue({ path: ['item', 'city'], code: 'custom', message: 'Cidade é obrigatória para publicação' });
  }
  if (!item.start_at) {
    ctx.addIssue({ path: ['item', 'start_at'], code: 'custom', message: 'Data de início é obrigatória para publicação' });
  }
  if (!item.end_at) {
    ctx.addIssue({ path: ['item', 'end_at'], code: 'custom', message: 'Data de fim é obrigatória para publicação' });
  }
  if (!item.cover_url) {
    ctx.addIssue({ path: ['item', 'cover_url'], code: 'custom', message: 'Capa é obrigatória para publicação' });
  }
  if (!item.alt_text) {
    ctx.addIssue({ path: ['item', 'alt_text'], code: 'custom', message: 'Texto alternativo da capa é obrigatório para publicação' });
  }
  if (!item.summary || item.summary.length < 10) {
    ctx.addIssue({ path: ['item', 'summary'], code: 'custom', message: 'Resumo de pelo menos 10 caracteres é obrigatório para publicação' });
  }

  // Validação de duração mínima
  if (item.start_at && item.end_at) {
    const start = new Date(item.start_at);
    const end = new Date(item.end_at);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    if (diffMinutes < 15) {
      ctx.addIssue({ path: ['item', 'end_at'], code: 'custom', message: 'A duração mínima deve ser de 15 minutos' });
    }
  }
});

// Schema completo para qualquer operação
export const AgendaSchema = AgendaBaseSchema;

// Tipos TypeScript
export type AgendaForm = z.infer<typeof AgendaFormSchema>;
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