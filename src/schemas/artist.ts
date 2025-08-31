import { z } from "zod";

// FORMULÁRIO RADICAL - APENAS CAMPOS ESSENCIAIS
export const artistSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  city: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  artist_type_id: z.string().uuid().optional().nullable(),
  genre_ids: z.array(z.string().uuid()).optional().default([]),
});

export type ArtistForm = z.infer<typeof artistSchema>;