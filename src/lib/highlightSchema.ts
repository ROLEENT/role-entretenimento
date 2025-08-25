import { z } from "zod";

export const highlightSchema = z.object({
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  event_title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  venue: z.string().min(2, "Local deve ter pelo menos 2 caracteres"),
  ticket_url: z.string().url("URL inválida").optional().or(z.literal('')),
  role_text: z.string().min(50, "Texto deve ter pelo menos 50 caracteres").max(400, "Texto deve ter no máximo 400 caracteres"),
  selection_reasons: z.array(z.string()).min(1, "Adicione pelo menos um motivo"),
  image_url: z.string().min(1, "Imagem é obrigatória"),
  photo_credit: z.string().optional(),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  ticket_price: z.string().optional(),
  sort_order: z.number().int().min(0).max(999).optional(),
  is_published: z.boolean().default(false)
});

export type HighlightFormData = z.infer<typeof highlightSchema>;