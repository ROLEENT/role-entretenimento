import { z } from 'zod';

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  url: /^https?:\/\/.+\..+/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  instagram: /^@?[a-zA-Z0-9._]{1,30}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cep: /^\d{5}-?\d{3}$/,
  pixKey: /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]{11}|[0-9]{14}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/,
};

// Common error messages in Portuguese
export const errorMessages = {
  required: 'Este campo é obrigatório',
  invalidEmail: 'Email inválido',
  invalidUrl: 'URL inválida',
  invalidPhone: 'Telefone inválido. Use o formato (11) 99999-9999',
  invalidCpf: 'CPF inválido. Use o formato 000.000.000-00',
  invalidCnpj: 'CNPJ inválido. Use o formato 00.000.000/0000-00',
  invalidCep: 'CEP inválido. Use o formato 00000-000',
  invalidInstagram: 'Usuário do Instagram inválido',
  invalidPixKey: 'Chave PIX inválida',
  tooShort: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  tooLong: (max: number) => `Deve ter no máximo ${max} caracteres`,
  dateInPast: 'Data deve ser futura',
  dateInFuture: 'Data deve ser passada',
  startAfterEnd: 'Data de início deve ser anterior à data de fim',
  minValue: (min: number) => `Valor mínimo é ${min}`,
  maxValue: (max: number) => `Valor máximo é ${max}`,
  invalidSelection: 'Seleção inválida',
  mustAcceptTerms: 'Você deve aceitar os termos',
  passwordTooWeak: 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número',
  passwordsDontMatch: 'Senhas não coincidem',
  fileTooBig: (maxSize: string) => `Arquivo muito grande. Tamanho máximo: ${maxSize}`,
  invalidFileType: (types: string) => `Tipo de arquivo inválido. Aceitos: ${types}`,
};

// Base field schemas for reuse
export const baseFields = {
  email: z.string()
    .min(1, errorMessages.required)
    .email(errorMessages.invalidEmail)
    .max(255, errorMessages.tooLong(255))
    .toLowerCase()
    .trim(),

  optionalEmail: z.string()
    .email(errorMessages.invalidEmail)
    .max(255, errorMessages.tooLong(255))
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),

  name: z.string()
    .min(2, errorMessages.tooShort(2))
    .max(100, errorMessages.tooLong(100))
    .trim(),

  optionalName: z.string()
    .max(100, errorMessages.tooLong(100))
    .trim()
    .optional(),

  phone: z.string()
    .regex(validationPatterns.phone, errorMessages.invalidPhone)
    .optional()
    .or(z.literal('')),

  url: z.string()
    .url(errorMessages.invalidUrl)
    .optional()
    .or(z.literal('')),

  requiredUrl: z.string()
    .min(1, errorMessages.required)
    .url(errorMessages.invalidUrl),

  slug: z.string()
    .min(3, errorMessages.tooShort(3))
    .max(100, errorMessages.tooLong(100))
    .regex(validationPatterns.slug, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .toLowerCase()
    .trim(),

  instagram: z.string()
    .regex(validationPatterns.instagram, errorMessages.invalidInstagram)
    .transform(val => val.replace(/^@+/, '').toLowerCase().trim())
    .optional()
    .or(z.literal('')),

  description: z.string()
    .max(2000, errorMessages.tooLong(2000))
    .trim()
    .optional(),

  requiredDescription: z.string()
    .min(10, errorMessages.tooShort(10))
    .max(2000, errorMessages.tooLong(2000))
    .trim(),

  shortText: z.string()
    .max(200, errorMessages.tooLong(200))
    .trim()
    .optional(),

  requiredShortText: z.string()
    .min(1, errorMessages.required)
    .max(200, errorMessages.tooLong(200))
    .trim(),

  cpf: z.string()
    .regex(validationPatterns.cpf, errorMessages.invalidCpf)
    .optional()
    .or(z.literal('')),

  cnpj: z.string()
    .regex(validationPatterns.cnpj, errorMessages.invalidCnpj)
    .optional()
    .or(z.literal('')),

  cep: z.string()
    .regex(validationPatterns.cep, errorMessages.invalidCep)
    .optional()
    .or(z.literal('')),

  pixKey: z.string()
    .regex(validationPatterns.pixKey, errorMessages.invalidPixKey)
    .optional()
    .or(z.literal('')),

  positiveNumber: z.number()
    .positive(errorMessages.minValue(0.01))
    .optional(),

  requiredPositiveNumber: z.number()
    .positive(errorMessages.minValue(0.01)),

  dateTime: z.string()
    .min(1, errorMessages.required)
    .datetime({ message: 'Data/hora inválida' }),

  optionalDateTime: z.string()
    .datetime({ message: 'Data/hora inválida' })
    .optional(),

  boolean: z.boolean(),

  requiredBoolean: z.boolean()
    .refine(val => val === true, errorMessages.mustAcceptTerms),

  uuid: z.string().uuid('ID inválido'),

  status: z.enum(['active', 'inactive', 'draft', 'published']),
};

// Conditional validation helpers
export const conditionalValidation = {
  requiredIf: <T>(condition: (data: any) => boolean, schema: z.ZodSchema<T>) => 
    z.any().refine((data) => !condition(data) || schema.safeParse(data).success, {
      message: errorMessages.required,
    }),

  urlRequiredIf: (condition: (data: any) => boolean) => 
    z.string().refine((val) => {
      if (!val || val.trim() === '') return true; // Allow empty
      return validationPatterns.url.test(val);
    }, errorMessages.invalidUrl),

  dateRange: (startField: string, endField: string) => 
    z.any().refine((data) => {
      const start = data[startField];
      const end = data[endField];
      if (!start || !end) return true;
      return new Date(end) > new Date(start);
    }, {
      message: errorMessages.startAfterEnd,
      path: [endField],
    }),

  priceRange: (minField: string, maxField: string) =>
    z.any().refine((data) => {
      const min = data[minField];
      const max = data[maxField];
      if (min == null || max == null) return true;
      return max >= min;
    }, {
      message: 'Preço máximo deve ser maior ou igual ao preço mínimo',
      path: [maxField],
    }),
};

// File validation
export const fileValidation = {
  image: z.any()
    .refine((file) => file?.size <= 5000000, errorMessages.fileTooBig('5MB'))
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file?.type),
      errorMessages.invalidFileType('JPEG, PNG, WebP')
    ),

  document: z.any()
    .refine((file) => file?.size <= 10000000, errorMessages.fileTooBig('10MB'))
    .refine(
      (file) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file?.type),
      errorMessages.invalidFileType('PDF, DOC, DOCX')
    ),
};

// Validation utilities
export const validationUtils = {
  // Extract error message from Zod error
  getFirstError: (error: z.ZodError): string => {
    return error.errors[0]?.message || errorMessages.required;
  },

  // Convert Zod errors to field map
  errorsToFieldMap: (error: z.ZodError): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      fieldErrors[path] = err.message;
    });
    return fieldErrors;
  },

  // Validate single field
  validateField: <T>(schema: z.ZodSchema<T>, value: any): { isValid: boolean; error?: string } => {
    const result = schema.safeParse(value);
    return {
      isValid: result.success,
      error: result.success ? undefined : result.error.errors[0]?.message,
    };
  },

  // Clean form data (remove empty strings, trim strings)
  cleanFormData: (data: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        cleaned[key] = trimmed === '' ? undefined : trimmed;
      } else if (value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  },

  // Check if value is empty (null, undefined, empty string, empty array)
  isEmpty: (value: any): boolean => {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
};

export default {
  patterns: validationPatterns,
  messages: errorMessages,
  fields: baseFields,
  conditional: conditionalValidation,
  files: fileValidation,
  utils: validationUtils,
};