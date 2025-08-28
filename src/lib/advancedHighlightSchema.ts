import { z } from "zod";

// Schema completo para highlights com todos os campos solicitados
export const advancedHighlightSchema = z.object({
  // Básico
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  
  // Publicação
  status: z.enum(['draft', 'published']).default('draft'),
  publish_at: z.string().optional(),
  unpublish_at: z.string().optional(),
  
  // Datas do evento (UTC)
  start_at: z.string().min(1, "Data de início é obrigatória"),
  end_at: z.string().min(1, "Data de fim é obrigatória"),
  
  // Mídia
  cover_url: z.string().optional(),
  alt_text: z.string().optional(),
  focal_point_x: z.number().min(0).max(1).optional(),
  focal_point_y: z.number().min(0).max(1).optional(),
  
  // Conteúdo
  ticket_url: z.string().optional().refine((url) => {
    if (!url) return true;
    return url.startsWith('http://') || url.startsWith('https://');
  }, "URL deve começar com http:// ou https://"),
  
  tags: z.array(z.string().max(24, "Tag não pode ter mais de 24 caracteres")).max(6, "Máximo 6 tags"),
  type: z.string().optional(),
  
  // Comercial
  patrocinado: z.boolean().default(false),
  anunciante: z.string().optional(),
  cupom: z.string().optional(),
  
  // SEO
  meta_title: z.string().max(60, "Meta título não pode ter mais de 60 caracteres").optional(),
  meta_description: z.string().max(160, "Meta descrição não pode ter mais de 160 caracteres").optional(),
  noindex: z.boolean().default(false),
  
  // Relacionamentos
  event_id: z.string().optional(),
  organizer_id: z.string().optional(),
  venue_id: z.string().optional(),
  
  // Avançado
  priority: z.number().min(0).max(999).default(100),
  
  // Campos para compatibilidade com schema antigo
  venue: z.string().optional(),
  role_text: z.string().optional(),
  selection_reasons: z.array(z.string()).optional().default([]),
  image_url: z.string().optional(),
  photo_credit: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  ticket_price: z.string().optional(),
  sort_order: z.number().optional().default(100),
  is_published: z.boolean().default(false)
});

// Schema para validação de publicação
export const publishValidationSchema = advancedHighlightSchema.refine((data) => {
  if (data.status === 'published') {
    return !!(data.title && data.slug && data.city && data.start_at && data.end_at && data.cover_url && data.alt_text);
  }
  return true;
}, {
  message: "Para publicar é necessário: título, slug, cidade, datas de início e fim, capa e texto alternativo",
  path: ["status"]
});

// Schema para validação de datas
export const dateValidationSchema = advancedHighlightSchema.refine((data) => {
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
});

export type AdvancedHighlightFormData = z.infer<typeof advancedHighlightSchema>;

// Utilitários para badges de qualidade
export const getQualityBadges = (data: Partial<AdvancedHighlightFormData>) => {
  const badges = [];
  
  if (!data.cover_url) badges.push({ type: 'warning', text: 'Sem capa' });
  if (!data.city) badges.push({ type: 'warning', text: 'Sem cidade' });
  if (data.start_at && data.end_at && new Date(data.start_at) >= new Date(data.end_at)) {
    badges.push({ type: 'error', text: 'Datas invertidas' });
  }
  // TODO: verificar slug duplicado
  
  return badges;
};

// Utilitário para checklist de publicação
export const getPublishChecklist = (data: Partial<AdvancedHighlightFormData>) => {
  return [
    { item: 'Título preenchido', completed: !!data.title },
    { item: 'Slug único', completed: !!data.slug },
    { item: 'Cidade selecionada', completed: !!data.city },
    { item: 'Data de início', completed: !!data.start_at },
    { item: 'Data de fim', completed: !!data.end_at },
    { item: 'Capa carregada', completed: !!data.cover_url },
    { item: 'Texto alternativo', completed: !!data.alt_text }
  ];
};