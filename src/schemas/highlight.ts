import { z } from "zod";

// Schema unificado para highlights
export const HighlightFormSchema = z.object({
  // Campos obrigatórios
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  start_at: z.string().min(1, "Data de início é obrigatória"),
  end_at: z.string().min(1, "Data de fim é obrigatória"),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  
  // Mídia
  cover_url: z.string().optional(),
  alt_text: z.string().optional(),
  focal_point_x: z.number().min(0).max(1).default(0.5),
  focal_point_y: z.number().min(0).max(1).default(0.5),
  
  // Conteúdo
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  ticket_url: z.string().optional(),
  tags: z.array(z.string()).default([]),
  type: z.string().optional(),
  
  // Publicidade
  patrocinado: z.boolean().default(false),
  anunciante: z.string().optional(),
  cupom: z.string().optional(),
  
  // Prioridade
  priority: z.number().default(100),
  
  // SEO
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
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
});

export type HighlightForm = z.infer<typeof HighlightFormSchema>;

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

// Schemas derivados
export const HighlightCreateSchema = HighlightFormSchema.omit({ id: true, updated_at: true });
export const HighlightUpdateSchema = HighlightFormSchema.partial().required({ id: true });

export type HighlightCreate = z.infer<typeof HighlightCreateSchema>;
export type HighlightUpdate = z.infer<typeof HighlightUpdateSchema>;