import { z } from "zod";

export const EventHighlight = z.enum(['none','curatorial','vitrine']);
export const PublicationStatus = z.enum(['draft','review','scheduled','published','archived']);

export const zEvent = z.object({
  // Identidade
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  city: z.string().min(2, "Cidade é obrigatória"),

  // Local e organizadores
  venue_id: z.string().uuid().nullable(),
  organizer_ids: z.array(z.string().uuid()).default([]),

  // Apoiadores e patrocinadores
  supporters: z.array(z.object({
    agent_id: z.string().uuid().optional(),
    name: z.string().min(2).optional(),
    tier: z.string().optional()
  })).default([]),

  sponsors: z.array(z.object({
    agent_id: z.string().uuid().optional(),
    name: z.string().min(2).optional(),
    tier: z.string().optional()
  })).default([]),

  // Mídia
  cover_url: z.string().url("URL da capa é obrigatória"),
  cover_alt: z.string().min(3, "Texto alternativo da capa é obrigatório"),

  // Datas
  start_utc: z.string().datetime("Data de início deve ser válida"),
  end_utc: z.string().datetime("Data de fim deve ser válida"),

  // Música
  artists_names: z.array(z.string()).max(12, "Máximo 12 artistas").default([]),

  // Performances cênicas
  performances: z.array(z.object({
    name: z.string().min(1, "Nome da performance é obrigatório"),
    kind: z.enum(['live','performance','instalacao','intervencao','teatro','outro']).default('performance'),
    starts_at: z.string().datetime().optional(),
    stage: z.string().optional(),
    notes: z.string().optional()
  })).default([]),

  // Artes visuais
  visual_art: z.array(z.object({
    name: z.string().min(1, "Nome do artista visual é obrigatório"),
    work: z.string().optional(),
    portfolio_url: z.string().url("URL do portfólio deve ser válida").optional()
  })).default([]),

  // Destaque
  highlight_type: EventHighlight.default('none'),
  is_sponsored: z.boolean().default(false),

  // Ingressos e links
  ticketing: z.object({
    platform: z.enum(['shotgun','sympla','ingresse','other']).optional(),
    url: z.string().url("URL de ingressos deve ser válida").optional(),
    min_price: z.number().nonnegative("Preço mínimo deve ser positivo").nullable(),
    max_price: z.number().nonnegative("Preço máximo deve ser positivo").nullable(),
    free_until: z.string().datetime().optional(),
  }).optional(),

  links: z.object({
    site: z.string().url("URL do site deve ser válida").optional(),
    instagram: z.string().url("URL do Instagram deve ser válida").optional(),
    map: z.string().url("URL do mapa deve ser válida").optional(),
    playlist: z.string().url("URL da playlist deve ser válida").optional(),
    video: z.string().url("URL do vídeo deve ser válida").optional(),
    previous_edition: z.string().url("URL da edição anterior deve ser válida").optional()
  }).partial().default({}),

  // Conteúdo e metadados
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  tags: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  og_image_url: z.string().url("URL da imagem OG deve ser válida").optional(),

  // Publicação
  status: PublicationStatus.default('draft'),
  publish_at: z.string().datetime().optional(),
  published_at: z.string().datetime().optional(),

  // Série
  series_id: z.string().uuid().optional(),
  edition_number: z.number().int().positive().optional(),
})
.refine(d => new Date(d.start_utc) < new Date(d.end_utc), {
  path: ['end_utc'],
  message: 'Data de fim precisa ser depois da data de início'
})
.refine(d => {
  if (d.ticketing?.min_price && d.ticketing?.max_price) {
    return d.ticketing.min_price <= d.ticketing.max_price;
  }
  return true;
}, {
  path: ['ticketing', 'max_price'],
  message: 'Preço máximo deve ser maior ou igual ao preço mínimo'
});

export type EventFormV3 = z.infer<typeof zEvent>;

// Validação de publicação
export const validateEventForPublish = (data: EventFormV3): string[] => {
  const errors: string[] = [];
  
  if (!data.venue_id) errors.push("Local é obrigatório para publicação");
  if (!data.cover_url) errors.push("Capa é obrigatória para publicação");
  if (!data.cover_alt || data.cover_alt.length < 3) errors.push("Texto alternativo da capa é obrigatório para publicação");
  if (!data.description || data.description.length < 10) errors.push("Descrição é obrigatória para publicação");
  if (!data.ticketing?.url && !data.links?.site) errors.push("Pelo menos um link de ingresso ou site é obrigatório para publicação");
  
  return errors;
};