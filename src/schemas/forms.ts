import { z } from 'zod';

// Schema para candidaturas (Trabalhe Conosco)
export const ApplicationSchema = z.object({
  full_name: z.string().min(2, 'Nome completo é obrigatório').max(100),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().max(20).optional(),
  portfolio_url: z.string().url('URL inválida').optional().or(z.literal('')),
  role: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
  lgpd_consent: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de privacidade'
  })
});

// Schema para contato
export const ContactSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(100),
  email: z.string().email('Email inválido').max(255),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(2000)
});

// Schema para newsletter
export const NewsletterSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  name: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  preferences: z.array(z.string()).optional()
});

export type ApplicationData = z.infer<typeof ApplicationSchema>;
export type ContactData = z.infer<typeof ContactSchema>;
export type NewsletterData = z.infer<typeof NewsletterSchema>;