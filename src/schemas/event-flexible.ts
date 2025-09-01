import { z } from "zod";

// Flexible event schema with minimal required fields
export const eventFlexibleSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Only title is required
  title: z.string().min(3, "Título é obrigatório"),
  slug: z.string().optional(), // Auto-generated
  status: z.enum(["draft", "published"]).default("draft"),
  
  // Optional fields
  city_id: z.string().uuid().optional().nullable(),
  venue_id: z.string().uuid().optional().nullable(),
  organizer_id: z.string().uuid().optional().nullable(),
  starts_at: z.string().optional().nullable(), // ISO
  ends_at: z.string().optional().nullable(),   // ISO
  price_min: z.number().nonnegative().optional().nullable(),
  price_max: z.number().nonnegative().optional().nullable(),
  age_rating: z.string().optional().nullable(),
  lineup: z.array(z.string().uuid()).default([]), // artistas
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(), // HTML/Markdown
  links: z.array(z.object({ 
    label: z.string().min(1, "Label é obrigatório"), 
    url: z.string().url("URL inválida") 
  })).optional().default([]),
  cover_url: z.string().optional().or(z.literal('')).nullable(),
  gallery: z.array(z.string()).default([]),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

export type EventFlexibleForm = z.infer<typeof eventFlexibleSchema>;