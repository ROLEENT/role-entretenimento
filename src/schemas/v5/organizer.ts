import { z } from "zod";

// Validation schema for organizer according to brief
export const organizerV5Schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  about: z.string().max(600, "Sobre deve ter no máximo 600 caracteres").optional(),
  contacts: z.object({
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    instagram: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().url("URL inválida").optional().or(z.literal("")),
  }).optional(),
  logo_url: z.string().url("URL inválida").optional().or(z.literal("")),
  logo_alt: z.string().optional(),
}).refine((data) => {
  // logo_alt é obrigatório se tiver logo_url (para publicar)
  if (data.logo_url && data.logo_url.length > 0) {
    return data.logo_alt && data.logo_alt.length > 0;
  }
  return true;
}, {
  message: "Alt text é obrigatório quando há logo",
  path: ["logo_alt"]
});

export type OrganizerV5Form = z.infer<typeof organizerV5Schema>;