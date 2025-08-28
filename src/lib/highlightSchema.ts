import { z } from "zod";

export const highlightSchema = z.object({
  city: z.enum(['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro']),
  event_title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  venue: z.string().min(2, "Local deve ter pelo menos 2 caracteres"),
  ticket_url: z.union([
    z.string().url("URL inválida"),
    z.literal(''),
    z.undefined()
  ]).optional().transform(val => val || ''),
  role_text: z.string().min(50, "Texto deve ter pelo menos 50 caracteres").max(400, "Texto deve ter no máximo 400 caracteres"),
  selection_reasons: z.array(z.string()).min(1, "Adicione pelo menos um motivo"),
  image_url: z.string().min(1, "Imagem é obrigatória"),
  photo_credit: z.union([z.string(), z.undefined()]).optional().transform(val => val || ''),
  event_date: z.union([z.string(), z.undefined()]).optional().transform(val => val || ''),
  event_time: z.union([z.string(), z.undefined()]).optional().transform(val => val || ''),
  ticket_price: z.union([z.string(), z.undefined()]).optional().transform(val => val || ''),
  sort_order: z.union([z.number(), z.undefined()]).optional().transform(val => val || 100),
  is_published: z.boolean().default(false)
});

export type HighlightFormData = z.infer<typeof highlightSchema>;