import { z } from "zod";

export const eventV3Schema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  venue: z.string().optional(),
  venue_id: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  start_utc: z.string().optional(),
  end_utc: z.string().optional(),
  image_url: z.string().optional(),
  cover_url: z.string().optional(),
  cover_alt: z.string().optional(),
  published: z.boolean().default(false),
  slug: z.string().optional(),
  highlight_type: z.string().optional(),
  is_sponsored: z.boolean().optional(),
  artists_names: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  performances: z.array(z.any()).default([]),
  visual_art: z.array(z.any()).default([]),
  ticketing: z.object({
    url: z.string().optional(),
    site: z.string().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    links: z.array(z.object({
      url: z.string(),
      label: z.string()
    })).default([])
  }).optional(),
  links: z.object({
    site: z.string().optional()
  }).optional(),
});

export type EventV3FormData = z.infer<typeof eventV3Schema>;
export type EventFormV3 = EventV3FormData;

export function validateEventForPublish(data: EventFormV3): string[] {
  // Basic validation for publishing - return array of errors
  const errors: string[] = [];
  
  if (!data.title) errors.push("Título é obrigatório");
  if (!data.description) errors.push("Descrição é obrigatória");
  if (!data.venue) errors.push("Local é obrigatório");
  if (!data.starts_at) errors.push("Data de início é obrigatória");
  
  return errors;
}