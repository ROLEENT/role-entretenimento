import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  venue: z.string().optional(),
  venue_id: z.string().nullable().optional(),
  location: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  image_url: z.string().optional(),
  published: z.boolean().default(false),
  slug: z.string().optional(),
  status: z.string().optional(),
  city_id: z.string().optional(),
  organizer_id: z.string().nullable().optional(),
  price_min: z.number().nullable().optional(),
  price_max: z.number().nullable().optional(),
  age_rating: z.string().nullable().optional(),
  lineup: z.array(z.any()).default([]),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  links: z.array(z.any()).default([]),
  cover_url: z.string().optional(),
  gallery: z.array(z.any()).default([]),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type EventForm = EventFormData;