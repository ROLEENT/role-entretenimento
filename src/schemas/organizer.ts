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
  
  // Contact info (same as artist)
  instagram: z.string()
    .optional()
    .transform((val) => val ? normalizeInstagram(val) : val)
    .refine(
      async (instagram) => {
        if (!instagram) return true;
        
        // Call API to check for duplicates
        try {
          const response = await fetch('/api/validate-instagram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instagram, type: 'organizer' })
          });
          
          const result = await response.json();
          return !result.isDuplicate;
        } catch {
          // If API fails, allow the validation to pass
          return true;
        }
      },
      "Este Instagram já está sendo usado por outro organizador"
    ),
  
  email: z.string()
    .email("Email inválido")
    .optional(),
  
  phone: z.string()
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
  
  // Location
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('BR'),
  
  // Content
  bio: z.string().optional(),
  
  tags: z.array(z.string())
    .max(12, "Máximo de 12 tags permitidas")
    .default([]),
  
  // Media
  logo_url: z.string().url("URL inválida").optional(),
  cover_url: z.string().url("URL inválida").optional(),
  
  // Metadata
  status: OrganizerStatus.default('active'),
  priority: z.number().int().default(0),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type OrganizerFormData = z.infer<typeof organizerSchema>;

// Export for form options
export const ORGANIZER_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
] as const;