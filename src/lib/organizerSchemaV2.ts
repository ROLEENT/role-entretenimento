import { z } from 'zod';

export const organizerSchemaV2 = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  type: z.enum(['organizador', 'produtora', 'coletivo', 'selo']).optional(),
  city: z.string().optional(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  avatar_url: z.string().optional(),
  cover_url: z.string().optional(),
  bio: z.string().optional(),
  bio_short: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type OrganizerFormDataV2 = z.infer<typeof organizerSchemaV2>;

// Função para gerar slug no client-side
export function generateSlugFromName(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'organizador-sem-nome';
  }
  
  return name
    .toLowerCase()
    .trim()
    // Remove acentos manualmente
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ý]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Remove caracteres especiais
    .replace(/[^a-z0-9\s-]/g, '')
    // Substitui espaços por hífens
    .replace(/\s+/g, '-')
    // Remove hífens múltiplos
    .replace(/-+/g, '-')
    // Remove hífens do início e fim
    .replace(/^-+|-+$/g, '');
}