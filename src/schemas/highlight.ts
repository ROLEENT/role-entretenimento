import { z } from "zod";

// Schema de rascunho - apenas title obrigatório
export const HighlightDraftSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  status: z.literal('draft'),
  // Outros campos opcionais
  id: z.string().optional(),
  slug: z.string().optional(),
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']).optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  cover_url: z.string().optional(),
  alt_text: z.string().optional(),
  focal_point_x: z.number().min(0).max(1).default(0.5),
  focal_point_y: z.number().min(0).max(1).default(0.5),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  ticket_url: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.string().optional(),
  patrocinado: z.boolean().default(false),
  anunciante: z.string().optional(),
  cupom: z.string().optional(),
  priority: z.number().default(100),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  noindex: z.boolean().default(false),
  publish_at: z.string().optional(),
  unpublish_at: z.string().optional(),
  event_id: z.string().optional(),
  organizer_id: z.string().optional(),
  venue_id: z.string().optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  updated_at: z.string().optional(),
  // Campos legados
  venue: z.string().optional(),
  role_text: z.string().optional(),
  selection_reasons: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  photo_credit: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  ticket_price: z.string().optional(),
  sort_order: z.number().default(100),
  is_published: z.boolean().default(false)
});

// Schema unificado para highlights com validações completas
export const HighlightFormSchema = z.object({
  // Campos obrigatórios
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  start_at: z.string().min(1, "Data de início é obrigatória"),
  end_at: z.string().min(1, "Data de fim é obrigatória"),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  
  // Mídia - obrigatório apenas para publicação
  cover_url: z.string().optional(),
  alt_text: z.string().optional(),
  focal_point_x: z.number().min(0).max(1).default(0.5),
  focal_point_y: z.number().min(0).max(1).default(0.5),
  
  // Conteúdo
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  ticket_url: z.string()
    .optional()
    .refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://'),
      "URL deve começar com http:// ou https://"
    ),
  tags: z.array(
    z.string().max(24, "Tag deve ter no máximo 24 caracteres")
  ).max(6, "Máximo 6 tags permitidas").default([]),
  type: z.string().optional(),
  
  // Publicidade
  patrocinado: z.boolean().default(false),
  anunciante: z.string().optional(),
  cupom: z.string().optional(),
  
  // Prioridade
  priority: z.number().default(100),
  
  // SEO
  meta_title: z.string()
    .max(60, "Título SEO deve ter no máximo 60 caracteres")
    .optional(),
  meta_description: z.string()
    .max(160, "Descrição SEO deve ter no máximo 160 caracteres")
    .optional(),
  noindex: z.boolean().default(false),
  
  // Agendamento
  publish_at: z.string().optional(),
  unpublish_at: z.string().optional(),
  
  // Relacionamentos
  event_id: z.string().optional(),
  organizer_id: z.string().optional(),
  venue_id: z.string().optional(),
  
  // Auditoria
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  updated_at: z.string().optional(),
  
  // Campos legados para compatibilidade
  venue: z.string().optional(),
  role_text: z.string().optional(),
  selection_reasons: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  photo_credit: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  ticket_price: z.string().optional(),
  sort_order: z.number().default(100),
  is_published: z.boolean().default(false)
}).refine((data) => {
  // Validação de datas: start_at e end_at devem ter diferença mínima de 15 min
  if (data.start_at && data.end_at) {
    const start = new Date(data.start_at);
    const end = new Date(data.end_at);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMinutes >= 15;
  }
  return true;
}, {
  message: "Data de fim deve ser pelo menos 15 minutos após o início",
  path: ["end_at"]
}).refine((data) => {
  // Validação para publicação: cover_url e alt_text obrigatórios se status='published'
  if (data.status === 'published') {
    return !!(data.cover_url?.trim() && data.alt_text?.trim());
  }
  return true;
}, {
  message: "Imagem de capa e texto alternativo são obrigatórios para publicação",
  path: ["cover_url"]
});

export type HighlightForm = z.infer<typeof HighlightFormSchema>;
export type HighlightDraft = z.infer<typeof HighlightDraftSchema>;

// Função para validar slug único
export const checkSlugUnique = async (slug: string, excludeId?: string) => {
  if (!slug) return false;
  
  const { supabase } = await import('@/integrations/supabase/client');
  let query = supabase.from('highlights').select('id').eq('slug', slug);
  
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  
  const { data, error } = await query;
  if (error) return false;
  
  return data.length === 0;
};

// Função para sugerir slug alternativo
export const suggestAlternativeSlug = async (baseSlug: string, excludeId?: string) => {
  let counter = 2;
  let newSlug = `${baseSlug}-${counter}`;
  
  while (!(await checkSlugUnique(newSlug, excludeId))) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
    if (counter > 100) break; // Evitar loop infinito
  }
  
  return newSlug;
};

// Validações específicas para publicação
export const getPublishChecklist = (data: HighlightForm) => {
  const checks = {
    title: !!data.title?.trim(),
    slug: !!data.slug?.trim(),
    city: !!data.city,
    cover_url: !!data.cover_url?.trim(),
    alt_text: !!data.alt_text?.trim(),
    start_at: !!data.start_at?.trim(),
    end_at: !!data.end_at?.trim(),
    summary: !!data.summary?.trim(),
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const canPublish = passed === total;
  
  return { checks, passed, total, canPublish };
};

// Função para obter resumo de erros
export const getErrorSummary = (errors: any) => {
  const errorMessages: string[] = [];
  
  const addError = (field: string, message: string) => {
    errorMessages.push(`${field}: ${message}`);
  };
  
  if (errors.title) addError("Título", errors.title.message);
  if (errors.slug) addError("Slug", errors.slug.message);
  if (errors.start_at) addError("Data início", errors.start_at.message);
  if (errors.end_at) addError("Data fim", errors.end_at.message);
  if (errors.cover_url) addError("Imagem", errors.cover_url.message);
  if (errors.alt_text) addError("Texto alt", errors.alt_text.message);
  if (errors.ticket_url) addError("URL ingressos", errors.ticket_url.message);
  if (errors.tags) addError("Tags", errors.tags.message);
  if (errors.meta_title) addError("Título SEO", errors.meta_title.message);
  if (errors.meta_description) addError("Descrição SEO", errors.meta_description.message);
  
  return errorMessages;
};

// Schema base sem validações complexas para facilitar derivações
const BaseHighlightSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  start_at: z.string().min(1, "Data de início é obrigatória"),
  end_at: z.string().min(1, "Data de fim é obrigatória"),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  cover_url: z.string().optional(),
  alt_text: z.string().optional(),
  focal_point_x: z.number().min(0).max(1).default(0.5),
  focal_point_y: z.number().min(0).max(1).default(0.5),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  ticket_url: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.string().optional(),
  patrocinado: z.boolean().default(false),
  anunciante: z.string().optional(),
  cupom: z.string().optional(),
  priority: z.number().default(100),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  noindex: z.boolean().default(false),
  publish_at: z.string().optional(),
  unpublish_at: z.string().optional(),
  event_id: z.string().optional(),
  organizer_id: z.string().optional(),
  venue_id: z.string().optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  updated_at: z.string().optional(),
  venue: z.string().optional(),
  role_text: z.string().optional(),
  selection_reasons: z.array(z.string()).default([]),
  image_url: z.string().optional(),
  photo_credit: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  ticket_price: z.string().optional(),
  sort_order: z.number().default(100),
  is_published: z.boolean().default(false)
});

// Schemas derivados
export const HighlightCreateSchema = BaseHighlightSchema.omit({ id: true, updated_at: true });
export const HighlightUpdateSchema = BaseHighlightSchema.partial().required({ id: true });

export type HighlightCreate = z.infer<typeof HighlightCreateSchema>;
export type HighlightUpdate = z.infer<typeof HighlightUpdateSchema>;