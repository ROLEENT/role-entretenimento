import { z } from 'zod';

// Helper for optional strings that treats '' and null as undefined
const zStrOpt = (max?: number) =>
  z.preprocess(v => (v === '' || v === null ? undefined : v),
    max ? z.string().max(max) : z.string()
  ).optional();

// Helper for optional dates
const zDateOpt = () =>
  z.preprocess(v => (v === '' || v === null ? undefined : v), z.string().datetime().optional());

// Helper for optional URLs
const zUrlOpt = () =>
  z.preprocess(v => (v === '' || v === null ? undefined : v), z.string().url().optional());

// Schema para rascunho (validação mínima)
export const agendaDraftSchema = z.object({
  // Básico - obrigatórios apenas para rascunho
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  
  // Básico - opcionais para rascunho
  city: zStrOpt(),
  start_at: z.date().optional(),
  end_at: z.date().optional(),
  type: zStrOpt(),
  priority: z.number().int().min(0).default(0),
  
  // Conteúdo
  subtitle: zStrOpt(),
  summary: zStrOpt(),
  ticket_url: z.preprocess(v => (v === '' || v === null ? undefined : v), 
    z.string().url('URL deve ser válida').optional())
    .refine((url) => !url || url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL deve começar com http:// ou https://'
    }),
  tags: z.array(z.string().max(24, 'Tag deve ter no máximo 24 caracteres'))
    .max(6, 'Máximo 6 tags permitidas')
    .default([]),
  
  // Mídia
  cover_url: zStrOpt(),
  alt_text: zStrOpt(),
  focal_point_x: z.number()
    .min(0, 'Deve estar entre 0 e 1')
    .max(1, 'Deve estar entre 0 e 1')
    .optional(),
  focal_point_y: z.number()
    .min(0, 'Deve estar entre 0 e 1')
    .max(1, 'Deve estar entre 0 e 1')
    .optional(),
  
  // SEO
  meta_title: zStrOpt(60),
  meta_description: zStrOpt(160),
  noindex: z.boolean().default(false),
  
  // Campos adicionais
  anunciante: zStrOpt(),
  cupom: zStrOpt(),
  
  // Publicação
  status: z.enum(['draft', 'published']).default('draft'),
  visibility_type: z.enum(['curadoria', 'vitrine']).default('curadoria'),
  publish_at: z.date().optional(),
  unpublish_at: z.date().optional(),
  
  // Relacionamentos
  event_id: z.string().uuid().optional(),
  organizer_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
});

// Schema base para publicação (todos os campos obrigatórios)
const basePublishSchema = z.object({
  // Básico - obrigatórios
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  city: z.enum(['porto_alegre', 'sao_paulo', 'rio_de_janeiro', 'florianopolis', 'curitiba'], {
    required_error: 'Cidade é obrigatória'
  }),
  start_at: z.date({ required_error: 'Data de início é obrigatória' }),
  end_at: z.date({ required_error: 'Data de fim é obrigatória' }),
  type: zStrOpt(),
  priority: z.number().int().min(0).default(0),
  
  // Conteúdo
  subtitle: zStrOpt(),
  summary: zStrOpt(),
  ticket_url: z.preprocess(v => (v === '' || v === null ? undefined : v), 
    z.string().url('URL deve ser válida').optional())
    .refine((url) => !url || url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL deve começar com http:// ou https://'
    }),
  tags: z.array(z.string().max(24, 'Tag deve ter no máximo 24 caracteres'))
    .max(6, 'Máximo 6 tags permitidas')
    .default([]),
  
  // Mídia - obrigatórios para publicar
  cover_url: z.string().min(1, 'Capa é obrigatória para publicar'),
  alt_text: z.string().min(1, 'Texto alternativo é obrigatório para publicar'),
  focal_point_x: z.number()
    .min(0, 'Deve estar entre 0 e 1')
    .max(1, 'Deve estar entre 0 e 1')
    .optional(),
  focal_point_y: z.number()
    .min(0, 'Deve estar entre 0 e 1')
    .max(1, 'Deve estar entre 0 e 1')
    .optional(),
  
  // SEO
  meta_title: zStrOpt(60),
  meta_description: zStrOpt(160),
  noindex: z.boolean().default(false),
  
  // Campos adicionais
  anunciante: zStrOpt(),
  cupom: zStrOpt(),
  
  // Publicação
  status: z.enum(['draft', 'published']).default('draft'),
  visibility_type: z.enum(['curadoria', 'vitrine']).default('curadoria'),
  publish_at: z.date().optional(),
  unpublish_at: z.date().optional(),
  
  // Relacionamentos
  event_id: z.string().uuid().optional(),
  organizer_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
});

// Schema para publicação com validação de datas
export const publishSchema = basePublishSchema.refine((data) => {
  if (data.start_at && data.end_at) {
    const diffMs = data.end_at.getTime() - data.start_at.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes >= 15;
  }
  return true;
}, {
  message: 'Data de fim deve ser pelo menos 15 minutos após o início',
  path: ['end_at']
});

// Schema principal (compatibilidade)
export const agendaFormSchema = agendaDraftSchema;

export type AgendaFormData = z.infer<typeof agendaDraftSchema>;
export type PublishFormData = z.infer<typeof publishSchema>;
export type DraftFormData = z.infer<typeof agendaDraftSchema>;

export const CITY_OPTIONS = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
] as const;

export const VISIBILITY_OPTIONS = [
  { value: 'curadoria', label: 'Curadoria' },
  { value: 'vitrine', label: 'Vitrine' },
] as const;