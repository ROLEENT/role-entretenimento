import { z } from "zod";

export const artistSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  instagram: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  short_bio: z.string().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const organizerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  site: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ArtistForm = z.infer<typeof artistSchema>;
export type OrganizerForm = z.infer<typeof organizerSchema>;