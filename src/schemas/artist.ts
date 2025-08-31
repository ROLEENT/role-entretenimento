import { z } from "zod";

const Url = z.string().url().or(z.literal("")).optional().transform(v => v || null);

export const artistSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  slug: z.string().optional().nullable(),
  artist_type_id: z.string().nullable().optional(),   // id, não objeto
  genre_ids: z.array(z.string()).default([]),         // ids
  instagram: z.string().optional().nullable(),
  links: z.object({
    website: Url,
    spotify: Url,
    soundcloud: Url,
    youtube: Url,
  }).partial().default({}),
});

export type ArtistForm = z.infer<typeof artistSchema>;