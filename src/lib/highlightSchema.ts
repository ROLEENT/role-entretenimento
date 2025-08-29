import { z } from "zod";

// Schema unificado para criar/editar highlights
export const highlightSchema = z.object({
  // Campos básicos obrigatórios
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().optional().default(''),
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  
  // Mídia - obrigatória para publicação
  cover_url: z.string().optional().default(''),
  alt_text: z.string().optional().default(''),
  focal_point_x: z.number().min(0).max(1).default(0.5),
  focal_point_y: z.number().min(0).max(1).default(0.5),
  
  // Datas - obrigatórias para publicação
  start_at: z.string().optional().default(''),
  end_at: z.string().optional().default(''),
  
  // Campos opcionais
  subtitle: z.string().optional().default(''),
  summary: z.string().optional().default(''),
  ticket_url: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
  type: z.string().optional().default(''),
  patrocinado: z.boolean().default(false),
  anunciante: z.string().optional().default(''),
  cupom: z.string().optional().default(''),
  priority: z.number().default(100),
  
  // Publicação agendada
  publish_at: z.string().optional().default(''),
  unpublish_at: z.string().optional().default(''),
  
  // SEO
  meta_title: z.string().optional().default(''),
  meta_description: z.string().optional().default(''),
  noindex: z.boolean().default(false),
  
  // Relacionamentos
  event_id: z.string().optional().default(''),
  organizer_id: z.string().optional().default(''),
  venue_id: z.string().optional().default(''),
  
  // Campos legados (manter para compatibilidade)
  venue: z.string().optional().default(''),
  role_text: z.string().optional().default(''),
  selection_reasons: z.array(z.string()).default([]),
  image_url: z.string().optional().default(''),
  photo_credit: z.string().optional().default(''),
  event_date: z.string().optional().default(''),
  event_time: z.string().optional().default(''),
  ticket_price: z.string().optional().default(''),
  sort_order: z.number().default(100),
  is_published: z.boolean().default(false),
  
  // Campos de auditoria
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
});

export type HighlightFormData = z.infer<typeof highlightSchema>;

// Validações para publicação
export const getPublishChecklist = (data: HighlightFormData) => {
  const checks = {
    title: !!data.title?.trim(),
    slug: !!data.slug?.trim(),
    city: !!data.city,
    cover_url: !!data.cover_url?.trim(),
    alt_text: !!data.alt_text?.trim(),
    start_at: !!data.start_at?.trim(),
    end_at: !!data.end_at?.trim(),
    venue: !!data.venue?.trim(),
    role_text: !!data.role_text?.trim() || !!data.summary?.trim(),
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const canPublish = passed === total;
  
  return { checks, passed, total, canPublish };
};