import { z } from "zod";

// Schema atualizado para refletir a estrutura real da tabela highlights
export const highlightSchema = z.object({
  // Campos básicos obrigatórios
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  start_at: z.string().min(1, "Data de início é obrigatória"),
  end_at: z.string().min(1, "Data de fim é obrigatória"),
  
  // Mídia obrigatória para publicação
  cover_url: z.string().min(1, "Imagem de capa é obrigatória"),
  alt_text: z.string().min(1, "Texto alternativo é obrigatório"),
  focal_point_x: z.number().min(0).max(1).default(0.5),
  focal_point_y: z.number().min(0).max(1).default(0.5),
  
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
  
  // Publicação
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
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
  
  // Campos legados para compatibilidade com a tabela
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