import { z } from "zod";

// Validation schema for magazine post according to brief
export const magazineV5Schema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  summary: z.string().max(300, "Resumo deve ter no máximo 300 caracteres").optional(),
  body_md: z.string().optional(),
  cover_url: z.string().url("URL inválida").optional().or(z.literal("")),
  cover_alt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  city: z.string().optional(),
  scheduled_at: z.date().optional(),
  published_at: z.date().optional(),
  related_event_id: z.string().uuid().optional(),
}).refine((data) => {
  // Para status "scheduled", exige scheduled_at no futuro
  if (data.status === "scheduled") {
    return data.scheduled_at && data.scheduled_at > new Date();
  }
  return true;
}, {
  message: "Data de agendamento deve ser no futuro",
  path: ["scheduled_at"]
}).refine((data) => {
  // Para publicar, exige body_md com pelo menos 500 chars
  if (data.status === "published") {
    return data.body_md && data.body_md.length >= 500;
  }
  return true;
}, {
  message: "Conteúdo deve ter pelo menos 500 caracteres para publicar",
  path: ["body_md"]
}).refine((data) => {
  // Para publicar, exige cover_url e cover_alt
  if (data.status === "published") {
    return data.cover_url && data.cover_url.length > 0 && data.cover_alt && data.cover_alt.length > 0;
  }
  return true;
}, {
  message: "Capa e alt text são obrigatórios para publicar",
  path: ["cover_url"]
});

export type MagazineV5Form = z.infer<typeof magazineV5Schema>;