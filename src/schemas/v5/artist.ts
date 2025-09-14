import { z } from "zod";

// Validation schema for artist according to brief
export const artistV5Schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z.string().min(1, "Slug é obrigatório"),
  bio_short: z.string().max(400, "Bio deve ter no máximo 400 caracteres").optional(),
  links: z.object({
    instagram: z.string().url("URL inválida").optional().or(z.literal("")),
    soundcloud: z.string().url("URL inválida").optional().or(z.literal("")),
    spotify: z.string().url("URL inválida").optional().or(z.literal("")),
    website: z.string().url("URL inválida").optional().or(z.literal("")),
  }).optional(),
  photo_url: z.string().url("URL inválida").optional().or(z.literal("")),
  photo_alt: z.string().optional(),
}).refine((data) => {
  // photo_alt é obrigatório se tiver photo_url (para publicar)
  if (data.photo_url && data.photo_url.length > 0) {
    return data.photo_alt && data.photo_alt.length > 0;
  }
  return true;
}, {
  message: "Alt text é obrigatório quando há foto",
  path: ["photo_alt"]
});

export type ArtistV5Form = z.infer<typeof artistV5Schema>;