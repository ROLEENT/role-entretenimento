import { z } from "zod";

export const highlightSchema = z.object({
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  event_title: z.string().min(1, "Título é obrigatório"),
  venue: z.string().min(1, "Local é obrigatório"),
  ticket_url: z.string().optional().default(''),
  role_text: z.string().min(10, "Texto deve ter pelo menos 10 caracteres"),
  selection_reasons: z.array(z.string()).min(1, "Adicione pelo menos um motivo"),
  image_url: z.string().min(1, "Imagem é obrigatória"),
  photo_credit: z.string().optional().default(''),
  event_date: z.string().optional().default(''),
  event_time: z.string().optional().default(''),
  ticket_price: z.string().optional().default(''),
  sort_order: z.number().optional().default(100),
  is_published: z.boolean().default(false)
});

export type HighlightFormData = z.infer<typeof highlightSchema>;