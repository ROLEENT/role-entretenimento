import { z } from 'zod';
import { baseFields, conditionalValidation } from '@/lib/validation';

// Location schema for reuse
export const locationSchema = z.object({
  address: baseFields.shortText,
  address2: baseFields.shortText,
  city: baseFields.requiredShortText,
  state: baseFields.shortText,
  country: z.string().length(2, 'Código do país deve ter 2 caracteres').default('BR'),
  postal_code: baseFields.cep,
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// Contact schema for reuse
export const contactSchema = z.object({
  email: baseFields.optionalEmail,
  phone: baseFields.phone,
  whatsapp: baseFields.phone,
  website: baseFields.url,
});

// Required contact schema
export const requiredContactSchema = z.object({
  email: baseFields.email,
  phone: baseFields.phone,
  whatsapp: baseFields.phone,
  website: baseFields.url,
});

// Social media links schema
export const socialLinksSchema = z.object({
  instagram: baseFields.instagram,
  facebook: baseFields.url,
  twitter: baseFields.url,
  linkedin: baseFields.url,
  youtube: baseFields.url,
  tiktok: baseFields.url,
  spotify: baseFields.url,
  soundcloud: baseFields.url,
}).optional();

// SEO schema for reuse
export const seoSchema = z.object({
  seo_title: z.string().max(60, 'Título SEO deve ter no máximo 60 caracteres').optional(),
  seo_description: z.string().max(160, 'Descrição SEO deve ter no máximo 160 caracteres').optional(),
  seo_keywords: z.array(z.string()).max(10, 'Máximo 10 palavras-chave').optional(),
});

// Media schema for reuse
export const mediaSchema = z.object({
  cover_url: baseFields.url,
  cover_alt: baseFields.shortText,
  gallery: z.array(baseFields.requiredUrl).default([]),
  logo_url: baseFields.url,
  avatar_url: baseFields.url,
  avatar_alt: baseFields.shortText,
});

// Bank info schema
export const bankSchema = z.object({
  bank: z.string().max(100, 'Nome do banco muito longo').optional(),
  agency: z.string().max(20, 'Agência inválida').optional(),
  account: z.string().max(30, 'Conta inválida').optional(),
  type: z.enum(['corrente', 'poupanca']).optional(),
  pix_key: baseFields.pixKey,
}).optional();

// Time range schema
export const timeRangeSchema = z.object({
  starts_at: baseFields.dateTime,
  ends_at: baseFields.dateTime,
}).refine((data) => {
  if (!data.starts_at || !data.ends_at) return true;
  const start = new Date(data.starts_at);
  const end = new Date(data.ends_at);
  return end > start;
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['ends_at'],
});

// Price range schema
export const priceRangeSchema = z.object({
  price_min: baseFields.positiveNumber,
  price_max: baseFields.positiveNumber,
}).refine((data) => {
  if (data.price_min == null || data.price_max == null) return true;
  return data.price_max >= data.price_min;
}, {
  message: 'Preço máximo deve ser maior ou igual ao preço mínimo',
  path: ['price_max'],
});

// Age rating enum
export const ageRatingSchema = z.enum([
  'livre',
  '10',
  '12', 
  '14',
  '16',
  '18'
]).optional();

// Common entity fields
export const entityBaseSchema = z.object({
  id: baseFields.uuid.optional(),
  created_at: baseFields.optionalDateTime,
  updated_at: baseFields.optionalDateTime,
  status: z.enum(['active', 'inactive', 'draft', 'published']).default('active'),
  priority: z.number().int().min(0).max(1000).default(0),
});

// Export types
export type LocationData = z.infer<typeof locationSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type RequiredContactData = z.infer<typeof requiredContactSchema>;
export type SocialLinksData = z.infer<typeof socialLinksSchema>;
export type SEOData = z.infer<typeof seoSchema>;
export type MediaData = z.infer<typeof mediaSchema>;
export type BankData = z.infer<typeof bankSchema>;
export type TimeRangeData = z.infer<typeof timeRangeSchema>;
export type PriceRangeData = z.infer<typeof priceRangeSchema>;
export type EntityBaseData = z.infer<typeof entityBaseSchema>;