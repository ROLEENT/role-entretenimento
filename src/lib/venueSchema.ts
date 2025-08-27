import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  type: z.enum(['bar', 'clube', 'casa_de_shows', 'teatro', 'galeria', 'espaco_cultural', 'restaurante'], {
    errorMap: () => ({ message: 'Tipo é obrigatório' })
  }),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  zip_code: z.string().min(1, 'CEP é obrigatório'),
  maps_url: z.string().url('URL do Maps inválida'),
  instagram: z.string().min(1, 'Instagram é obrigatório'),
  booking_email: z.string().email('Email inválido'),
  booking_whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  cover_image_url: z.string().optional(),
  capacity: z.number().min(1, 'Capacidade deve ser maior que 0').optional(),
  min_age: z.number().min(0, 'Idade mínima inválida').optional(),
  opening_hours: z.string().optional(),
  resources: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
  photo_policy: z.string().optional(),
  extra_photos: z.array(z.string()).default([]),
  website_url: z.string().url('URL inválida').optional().or(z.literal('')),
  responsible_name: z.string().optional(),
  internal_notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  priority: z.number().default(0),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type VenueFormData = z.infer<typeof venueSchema>;