import { z } from "zod";

const Url = z.string().url().or(z.literal("")).optional().transform(v => v || null);

export const artistSchema = z.object({
  // Informações básicas
  name: z.string().min(2, "Informe o nome"),
  slug: z.string().optional().nullable(),
  
  // IDs como strings simples
  artist_type_id: z.string().nullable().optional(),
  genre_ids: z.array(z.string()).default([]),
  
  // Informações de contato
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  
  // Localização
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default("BR"),
  
  // Biografia
  bio: z.string().optional().nullable(),
  
  // Links opcionais com validação
  links: z.object({
    website: Url,
    spotify: Url,
    soundcloud: Url,
    youtube: Url,
    beatport: Url,
    audius: Url,
  }).partial().default({}),
  
  // Tags
  tags: z.array(z.string()).default([]),
  
  // Avatar
  avatar_url: z.string().optional().nullable(),
  avatar_alt: z.string().optional().nullable(),
  
  // Status
  status: z.enum(["active", "inactive", "draft"]).default("active"),
  
  // Campos adicionais opcionais
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ArtistForm = z.infer<typeof artistSchema>;