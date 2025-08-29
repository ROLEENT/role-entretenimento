import { z } from 'zod';

// Schema base para reutilização
const baseAgendaSchema = z.object({
  // Básico
  title: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  city: z.enum(['porto_alegre', 'sao_paulo', 'rio_de_janeiro', 'florianopolis', 'curitiba'], {
    required_error: 'Cidade é obrigatória'
  }),
  start_at: z.date({ required_error: 'Data de início é obrigatória' }),
  end_at: z.date({ required_error: 'Data de fim é obrigatória' }),
  type: z.string().optional(),
  priority: z.number().int().min(0).default(0),
  
  // Conteúdo
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  ticket_url: z.string()
    .optional()
    .refine((url) => !url || url.startsWith('http://') || url.startsWith('https://'), {
      message: 'URL deve começar com http:// ou https://'
    }),
  tags: z.array(z.string().max(24, 'Tag deve ter no máximo 24 caracteres'))
    .max(6, 'Máximo 6 tags permitidas')
    .default([]),
  
  // Mídia
  cover_url: z.string().optional(),
  alt_text: z.string().optional(),
  focal_point_x: z.number()
    .min(0, 'Deve estar entre 0 e 1')
    .max(1, 'Deve estar entre 0 e 1')
    .optional(),
  focal_point_y: z.number()
    .min(0, 'Deve estar entre 0 e 1')
    .max(1, 'Deve estar entre 0 e 1')
    .optional(),
  
  // SEO
  meta_title: z.string()
    .max(60, 'Meta título deve ter no máximo 60 caracteres')
    .optional(),
  meta_description: z.string()
    .max(160, 'Meta descrição deve ter no máximo 160 caracteres')
    .optional(),
  noindex: z.boolean().default(false),
  
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

// Schema principal com validação de datas
export const agendaFormSchema = baseAgendaSchema.refine((data) => {
  // Validação de data: fim deve ser pelo menos 15 min após início
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

// Schema para publicação (campos obrigatórios extras)
export const publishSchema = baseAgendaSchema.extend({
  cover_url: z.string().min(1, 'Capa é obrigatória para publicar'),
  alt_text: z.string().min(1, 'Texto alternativo é obrigatório para publicar'),
}).refine((data) => {
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

export type AgendaFormData = z.infer<typeof agendaFormSchema>;
export type PublishFormData = z.infer<typeof publishSchema>;

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