import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
  cover_url: z.string().optional(), // Changed to optional since we'll use file upload
  start_at: z.string().min(1, 'Data/hora de início é obrigatória'),
  end_at: z.string().optional(),
  venue_name: z.string().min(1, 'Local é obrigatório'), // Changed from venue_id to venue_name
  venue_address: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  external_url: z.string().url('URL de ingressos inválida').optional().or(z.literal('')),
  instagram_post_url: z.string().url('URL do post inválida').optional().or(z.literal('')),
  organizer_name: z.string().optional(), // Changed from organizer_id to organizer_name
  price_min: z.number().min(0, 'Preço mínimo inválido').optional(),
  price_max: z.number().min(0, 'Preço máximo inválido').optional(),
  category: z.string().optional(),
  artists: z.array(z.string()).default([]),
  social_links: z.string().optional(),
  benefits: z.string().optional(),
  age_range: z.string().optional(),
  observations: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.string().default('active'),
});

export type EventFormData = z.infer<typeof eventSchema>;