import { z } from "zod";

// Validation schema for venue according to brief
export const venueV5Schema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  address: z.string().optional(),
  city: z.enum(["POA", "FLN", "CWB", "SP", "RJ"], {
    errorMap: () => ({ message: "Cidade deve ser POA, FLN, CWB, SP ou RJ" })
  }),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.number().int().positive("Capacidade deve ser positiva").optional(),
  about: z.string().optional(),
  cover_url: z.string().url("URL inválida").optional().or(z.literal("")),
  cover_alt: z.string().optional(),
}).refine((data) => {
  // cover_alt é obrigatório se tiver cover_url (para publicar)
  if (data.cover_url && data.cover_url.length > 0) {
    return data.cover_alt && data.cover_alt.length > 0;
  }
  return true;
}, {
  message: "Alt text é obrigatório quando há capa",
  path: ["cover_alt"]
});

export type VenueV5Form = z.infer<typeof venueV5Schema>;