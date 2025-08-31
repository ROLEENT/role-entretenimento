import { z } from "zod";

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  status: z.enum(["draft", "published"]).default("draft"),
  city_id: z.string().uuid("Selecione uma cidade"),
  venue_id: z.string().uuid().optional().nullable(),
  organizer_id: z.string().uuid().optional().nullable(),
  starts_at: z.string().min(1, "Data de início é obrigatória"), // ISO
  ends_at: z.string().min(1, "Data de fim é obrigatória"),   // ISO
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
  cover_url: z.string().url().optional().nullable(),
  gallery: z.array(z.string().url()).default([]),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
}).refine((data) => {
  if (data.starts_at && data.ends_at) {
    return new Date(data.ends_at) >= new Date(data.starts_at);
  }
  return true;
}, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["ends_at"],
});

export type EventForm = z.infer<typeof eventSchema>;