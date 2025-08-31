import { z } from 'zod';
import { baseFields } from '@/lib/validation';

// Schema para candidaturas (Trabalhe Conosco)
export const applicationSchema = z.object({
  full_name: baseFields.name,
  email: baseFields.email,
  phone: baseFields.phone,
  portfolio_url: baseFields.url,
  role: baseFields.shortText,
  message: baseFields.description,
  lgpd_consent: baseFields.requiredBoolean,
});

// Schema para contato
export const contactSchema = z.object({
  name: baseFields.name,
  email: baseFields.email,
  subject: baseFields.shortText,
  message: baseFields.requiredDescription,
});

// Schema para newsletter
export const newsletterSchema = z.object({
  email: baseFields.email,
  name: baseFields.optionalName,
  city: baseFields.shortText,
  preferences: z.array(z.string()).optional().default([]),
});

// Export legacy names for compatibility
export const ApplicationSchema = applicationSchema;
export const ContactSchema = contactSchema;
export const NewsletterSchema = newsletterSchema;

export type ApplicationData = z.infer<typeof applicationSchema>;
export type ContactData = z.infer<typeof contactSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;