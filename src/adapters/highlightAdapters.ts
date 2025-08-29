import { HighlightForm } from '@/schemas/highlight';

export interface HighlightDBRow {
  id?: string;
  title?: string;
  event_title?: string;
  slug?: string;
  city?: string;
  start_at?: string;
  end_at?: string;
  status?: string;
  cover_url?: string;
  image_url?: string;
  alt_text?: string;
  focal_point_x?: number;
  focal_point_y?: number;
  subtitle?: string;
  summary?: string;
  ticket_url?: string;
  tags?: string[];
  type?: string;
  patrocinado?: boolean;
  anunciante?: string;
  cupom?: string;
  priority?: number;
  sort_order?: number;
  meta_title?: string;
  meta_description?: string;
  noindex?: boolean;
  publish_at?: string;
  unpublish_at?: string;
  event_id?: string;
  organizer_id?: string;
  venue_id?: string;
  created_by?: string;
  updated_by?: string;
  updated_at?: string;
  created_at?: string;
  // Campos legados
  venue?: string;
  role_text?: string;
  selection_reasons?: string[];
  photo_credit?: string;
  event_date?: string;
  event_time?: string;
  ticket_price?: string;
  is_published?: boolean;
}

// Converte dados do banco para formulário
export const fromDB = (row: HighlightDBRow): HighlightForm => {
  return {
    id: row.id,
    title: row.title || row.event_title || '',
    slug: row.slug || '',
    city: row.city as any || 'porto_alegre',
    start_at: row.start_at || '',
    end_at: row.end_at || '',
    status: (row.status as any) || 'draft',
    cover_url: row.cover_url || row.image_url || '',
    alt_text: row.alt_text || '',
    focal_point_x: row.focal_point_x ?? 0.5,
    focal_point_y: row.focal_point_y ?? 0.5,
    subtitle: row.subtitle || '',
    summary: row.summary || '',
    ticket_url: row.ticket_url || '',
    tags: row.tags || [],
    type: row.type || '',
    patrocinado: row.patrocinado || false,
    anunciante: row.anunciante || '',
    cupom: row.cupom || '',
    priority: row.priority || row.sort_order || 100,
    meta_title: row.meta_title || '',
    meta_description: row.meta_description || '',
    noindex: row.noindex || false,
    publish_at: row.publish_at || '',
    unpublish_at: row.unpublish_at || '',
    event_id: row.event_id || '',
    organizer_id: row.organizer_id || '',
    venue_id: row.venue_id || '',
    created_by: row.created_by || '',
    updated_by: row.updated_by || '',
    updated_at: row.updated_at || '',
  };
};

// Converte dados do formulário para estrutura do banco
export const toDB = (form: HighlightForm): Partial<HighlightDBRow> => {
  return {
    title: form.title,
    slug: form.slug,
    city: form.city,
    start_at: form.start_at,
    end_at: form.end_at,
    status: form.status,
    cover_url: form.cover_url || null,
    alt_text: form.alt_text || null,
    focal_point_x: form.focal_point_x,
    focal_point_y: form.focal_point_y,
    subtitle: form.subtitle || null,
    summary: form.summary || null,
    ticket_url: form.ticket_url || null,
    tags: form.tags?.length ? form.tags : null,
    type: form.type || null,
    patrocinado: form.patrocinado,
    anunciante: form.anunciante || null,
    cupom: form.cupom || null,
    priority: form.priority,
    meta_title: form.meta_title || null,
    meta_description: form.meta_description || null,
    noindex: form.noindex,
    publish_at: form.publish_at || null,
    unpublish_at: form.unpublish_at || null,
    event_id: form.event_id || null,
    organizer_id: form.organizer_id || null,
    venue_id: form.venue_id || null,
    created_by: form.created_by || null,
    updated_by: form.updated_by || null,
  };
};

// Adapta para campos legados (compatibilidade)
export const toLegacyDB = (form: HighlightForm): Partial<HighlightDBRow> => {
  const base = toDB(form);
  return {
    ...base,
    // Mapeamentos para campos legados
    event_title: form.title,
    image_url: form.cover_url,
    sort_order: form.priority,
    is_published: form.status === 'published',
  };
};