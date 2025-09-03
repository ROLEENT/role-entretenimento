import { z } from 'zod';

export const organizerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  type: z.enum(['organizador', 'produtora', 'coletivo', 'selo']).optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  contact_email: z.string().email('Email inválido'),
  contact_whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  instagram: z.string().min(1, 'Instagram é obrigatório'),
  avatar_url: z.string().optional(),
  bio_short: z.string().max(300, 'Bio curta muito longa').optional(),
  bio_long: z.string().max(1500, 'Bio longa muito longa').optional(),
  website_url: z.string().url('URL inválida').optional().or(z.literal('')),
  portfolio_url: z.string().url('URL inválida').optional().or(z.literal('')),
  cover_image_url: z.string().optional(),
  cities_active: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  responsible_name: z.string().optional(),
  responsible_role: z.string().optional(),
  booking_whatsapp: z.string().optional(),
  booking_email: z.string().email('Email inválido').optional().or(z.literal('')),
  internal_notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  priority: z.number().default(0),
});

export type OrganizerFormData = z.infer<typeof organizerSchema>;