import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
  cover_url: z.string().optional(),
  start_at: z.string().min(1, 'Data/hora de início é obrigatória'),
  end_at: z.string().optional(),
  venue_id: z.string().uuid('Local é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  external_url: z.string().url('URL de ingressos inválida').optional().or(z.literal('')),
  instagram_post_url: z.string().url('URL do post inválida').optional().or(z.literal('')),
  organizer_id: z.string().uuid().optional(),
  price_min: z.number().min(0, 'Preço mínimo inválido').optional(),
  price_max: z.number().min(0, 'Preço máximo inválido').optional(),
  category: z.string().optional(),
  artist_ids: z.array(z.string().uuid()).default([]),
  social_links: z.string().optional(),
  benefits: z.string().optional(),
  age_range: z.string().optional(),
  observations: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'active', 'cancelled', 'completed']).optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;