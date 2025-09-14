import { z } from "zod";

// Validation schema for event according to brief
export const eventV5Schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  city: z.string().min(1, "Cidade é obrigatória"),
  start_utc: z.date(),
  end_utc: z.date(),
  price_from: z.number().min(0, "Preço deve ser positivo").default(0),
  age_rating: z.enum(["Livre", "16", "18"]).optional(),
  description: z.string().optional(),
  cover_url: z.string().url("URL inválida").optional().or(z.literal("")),
  cover_alt: z.string().optional(),
  lineup_notes: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  organizers: z.array(z.string().uuid()).default([]),
  artists: z.array(z.object({
    artist_id: z.string().uuid(),
    billing_order: z.number().int().default(0),
    role: z.string().optional(),
    is_headliner: z.boolean().default(false),
  })).default([]),
}).refine((data) => {
  // end_utc deve ser pelo menos 1h após start_utc
  const diffMs = data.end_utc.getTime() - data.start_utc.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= 1;
}, {
  message: "Evento deve durar pelo menos 1 hora",
  path: ["end_utc"]
}).refine((data) => {
  // Para agendar, start_utc deve ser no futuro
  if (data.status === "scheduled") {
    return data.start_utc > new Date();
  }
  return true;
}, {
  message: "Data de início deve ser no futuro para agendar",
  path: ["start_utc"]
}).refine((data) => {
  // Para publicar, exige venue_id
  if (data.status === "published") {
    return data.venue_id && data.venue_id.length > 0;
  }
  return true;
}, {
  message: "Local é obrigatório para publicar",
  path: ["venue_id"]
}).refine((data) => {
  // Para publicar, exige pelo menos 1 organizador
  if (data.status === "published") {
    return data.organizers.length > 0;
  }
  return true;
}, {
  message: "Pelo menos 1 organizador é obrigatório para publicar",
  path: ["organizers"]
}).refine((data) => {
  // Para publicar, exige pelo menos 1 artista
  if (data.status === "published") {
    return data.artists.length > 0;
  }
  return true;
}, {
  message: "Pelo menos 1 artista é obrigatório para publicar",
  path: ["artists"]
}).refine((data) => {
  // Para publicar, exige cover com alt
  if (data.status === "published") {
    return data.cover_url && data.cover_url.length > 0 && data.cover_alt && data.cover_alt.length > 0;
  }
  return true;
}, {
  message: "Capa e alt text são obrigatórios para publicar",
  path: ["cover_url"]
}).refine((data) => {
  // Para publicar, exige descrição com pelo menos 120 chars
  if (data.status === "published") {
    return data.description && data.description.length >= 120;
  }
  return true;
}, {
  message: "Descrição deve ter pelo menos 120 caracteres para publicar",
  path: ["description"]
});

export type EventV5Form = z.infer<typeof eventV5Schema>;