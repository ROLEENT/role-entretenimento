import { z } from "zod";
import { formValidation } from "@/lib/forms";

export const artistSchema = z.object({
  // Informações básicas
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(255, "Nome não pode exceder 255 caracteres")
    .trim(),
  
  slug: z
    .string({ required_error: "Slug é obrigatório" })
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .max(255, "Slug não pode exceder 255 caracteres")
    .regex(formValidation.slug, "Slug deve conter apenas letras, números e hífens")
    .trim(),
  
  // Tipo de artista (obrigatório)
  artist_type_id: z
    .string({ required_error: "Tipo de artista é obrigatório" })
    .min(1, "Tipo de artista é obrigatório"),
  
  // Gêneros musicais (array de IDs)
  genre_ids: z
    .array(z.string().min(1, "ID de gênero inválido"))
    .min(1, "Selecione pelo menos um gênero musical")
    .max(10, "Máximo de 10 gêneros permitidos"),
  
  // Informações de contato
  email: z
    .string()
    .optional()
    .refine((val) => !val || formValidation.email.test(val), {
      message: "E-mail deve ter um formato válido"
    }),
  
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.replace(/\D/g, '').length >= 10, {
      message: "Telefone deve ter pelo menos 10 dígitos"
    }),
  
  whatsapp: z
    .string()
    .optional()
    .refine((val) => !val || val.replace(/\D/g, '').length >= 10, {
      message: "WhatsApp deve ter pelo menos 10 dígitos"
    }),
  
  instagram: z
    .string()
    .optional()
    .refine((val) => !val || formValidation.instagram.test(val), {
      message: "Instagram deve ter um formato válido (apenas nome de usuário)"
    }),
  
  website: z
    .string()
    .optional()
    .refine((val) => !val || formValidation.url.test(val), {
      message: "Website deve ter um formato válido (https://...)"
    }),
  
  // Localização
  city: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: "Cidade deve ter pelo menos 2 caracteres"
    }),
  
  state: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 2, {
      message: "Estado deve ter 2 caracteres"
    }),
  
  country: z
    .string()
    .default("BR"),
  
  // Biografia
  bio: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 2000, {
      message: "Biografia não pode exceder 2000 caracteres"
    }),
  
  // Campos específicos do artista
  subtype: z
    .string()
    .optional(),
  
  // Tags e links
  tags: z
    .array(z.string().min(1, "Tag não pode estar vazia"))
    .default([])
    .refine((val) => val.length <= 20, {
      message: "Máximo de 20 tags permitidas"
    }),
  
  links: z
    .array(z.object({
      label: z.string().min(1, "Label do link é obrigatório"),
      url: z.string().url("URL deve ter um formato válido")
    }))
    .default([])
    .refine((val) => val.length <= 10, {
      message: "Máximo de 10 links permitidos"
    }),
  
  // Avatar
  avatar_url: z
    .string()
    .optional()
    .refine((val) => !val || formValidation.url.test(val), {
      message: "URL do avatar deve ser válida"
    }),
  
  // Status
  status: z
    .enum(["active", "inactive", "draft"], {
      required_error: "Status é obrigatório"
    })
    .default("draft"),
  
  // Campos adicionais opcionais
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ArtistForm = z.infer<typeof artistSchema>;