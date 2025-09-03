import { z } from "zod";

// Helper function to normalize Instagram handle
const normalizeInstagram = (handle: string): string => {
  return handle.replace(/^@+/, '').toLowerCase().trim();
};

// Helper function to validate slug format
const validateSlugFormat = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Status enum
export const OrganizerStatus = z.enum(['active', 'inactive']);
export type OrganizerStatusType = z.infer<typeof OrganizerStatus>;

// Bank schema
export const bankSchema = z.object({
  bank: z.string().max(100, "Nome do banco muito longo").optional(),
  agency: z.string().max(20, "Agência inválida").optional(), 
  account: z.string().max(30, "Conta inválida").optional(),
  type: z.enum(['corrente', 'poupanca']).optional(),
}).optional();

// Links schema
export const organizerLinksSchema = z.object({
  facebook: z.string().url("URL inválida").optional().or(z.literal('')),
  linkedin: z.string().url("URL inválida").optional().or(z.literal('')),
  youtube: z.string().url("URL inválida").optional().or(z.literal('')),
  tiktok: z.string().url("URL inválida").optional().or(z.literal('')),
  twitter: z.string().url("URL inválida").optional().or(z.literal('')),
}).optional();

// Organizer schema
export const organizerSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic info
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200, "Nome muito longo"),
  
  slug: z.string()
    .optional()
    .refine(
      (slug) => !slug || validateSlugFormat(slug),
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
  
  // Contact info
  instagram: z.string()
    .optional()
    .transform((val) => val ? normalizeInstagram(val) : val),
  
  email: z.string()
    .email("Email inválido")
    .optional(),
  
  phone: z.string()
    .optional(),

  whatsapp: z.string()
    .optional(),

  website: z.string()
    .url("URL inválida")
    .optional()
    .or(z.literal('')),
  
  // Invoice/billing info
  invoice_name: z.string()
    .max(200, "Nome de faturamento muito longo")
    .optional(),
  
  tax_id: z.string()
    .max(20, "CNPJ/CPF inválido")
    .optional(),
  
  invoice_email: z.string()
    .email("Email de faturamento inválido")
    .optional(),
  
  pix_key: z.string()
    .max(100, "Chave PIX muito longa")
    .optional(),

  // Bank info
  bank: bankSchema,

  // Additional links
  links: organizerLinksSchema,
  
  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('BR'),
  
  // Content
  bio: z.string().optional(),
  
  // Media
  avatar_url: z.string().url("URL inválida").optional(),
  avatar_alt: z.string().optional(),
  // Removed logo_url - using avatar_url instead
  cover_url: z.string().url("URL inválida").optional(),
  
  // Metadata
  status: OrganizerStatus.default('active'),
  priority: z.number().int().default(0),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type OrganizerFormData = z.infer<typeof organizerSchema>;
export type OrganizerBank = z.infer<typeof bankSchema>;
export type OrganizerLinks = z.infer<typeof organizerLinksSchema>;

// Export for form options
export const ORGANIZER_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
] as const;