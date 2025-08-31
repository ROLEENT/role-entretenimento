import { z } from 'zod';

// Portuguese error messages
const ptBRMessages = {
  required_error: "Campo obrigatório",
  invalid_type_error: "Tipo inválido",
  too_small: "Muito pequeno",
  too_big: "Muito grande",
  invalid_url: "URL inválida",
  invalid_email: "Email inválido",
  invalid_uuid: "UUID inválido",
  invalid_date: "Data inválida",
};

// Configure Zod with Portuguese messages
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === "string" && issue.received === "undefined") {
        return { message: ptBRMessages.required_error };
      }
      return { message: ptBRMessages.invalid_type_error };
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        return { message: `Mínimo ${issue.minimum} caracteres` };
      }
      if (issue.type === "array") {
        return { message: `Mínimo ${issue.minimum} itens` };
      }
      return { message: ptBRMessages.too_small };
    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        return { message: `Máximo ${issue.maximum} caracteres` };
      }
      if (issue.type === "array") {
        return { message: `Máximo ${issue.maximum} itens` };
      }
      return { message: ptBRMessages.too_big };
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "url") {
        return { message: ptBRMessages.invalid_url };
      }
      if (issue.validation === "email") {
        return { message: ptBRMessages.invalid_email };
      }
      if (issue.validation === "uuid") {
        return { message: ptBRMessages.invalid_uuid };
      }
      return { message: "Formato inválido" };
    case z.ZodIssueCode.invalid_date:
      return { message: ptBRMessages.invalid_date };
    default:
      return { message: ctx.defaultError };
  }
});

// Enums for agenda
export const ListingTypeEnum = z.enum(["destaque_curatorial", "vitrine_cultural"], {
  errorMap: () => ({ message: "Tipo de listagem deve ser 'destaque_curatorial' ou 'vitrine_cultural'" })
});

export const CityEnum = z.enum(["POA", "FLORIPA", "CURITIBA", "SP", "RJ"], {
  errorMap: () => ({ message: "Cidade deve ser POA, FLORIPA, CURITIBA, SP ou RJ" })
});

export const AgendaStatusEnum = z.enum(["draft", "published", "scheduled", "archived"], {
  errorMap: () => ({ message: "Status deve ser 'draft', 'published', 'scheduled' ou 'archived'" })
});

export const VisibilityTypeEnum = z.enum(["curadoria", "patrocinado", "comunidade"], {
  errorMap: () => ({ message: "Tipo de visibilidade deve ser 'curadoria', 'patrocinado' ou 'comunidade'" })
});

// Slug validation regex
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Base schema for agenda items (without refinements)
const BaseAgendaItemSchema = z.object({
  // Basic identification
  id: z.string().uuid("ID deve ser um UUID válido").optional(),
  title: z.string()
    .min(3, "Título deve ter pelo menos 3 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  slug: z.string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(100, "Slug deve ter no máximo 100 caracteres")
    .regex(slugRegex, "Slug deve conter apenas letras minúsculas, números e hífens"),
  subtitle: z.string()
    .max(300, "Subtítulo deve ter no máximo 300 caracteres")
    .optional(),
  
  // Classification
  listing_type: ListingTypeEnum.default("destaque_curatorial"),
  visibility_type: VisibilityTypeEnum.default("curadoria"),
  city: CityEnum,
  type: z.string()
    .max(50, "Tipo deve ter no máximo 50 caracteres")
    .optional(),
  
  // Dates and times - UTC with 15-minute intervals
  start_at_utc: z.date({
    required_error: "Data de início é obrigatória",
    invalid_type_error: "Data de início deve ser uma data válida"
  }).refine((date) => {
    // Ensure the date is rounded to 15-minute intervals
    const minutes = date.getMinutes();
    return minutes % 15 === 0;
  }, "Horário deve estar em intervalos de 15 minutos"),
  
  end_at_utc: z.date({
    required_error: "Data de fim é obrigatória", 
    invalid_type_error: "Data de fim deve ser uma data válida"
  }).refine((date) => {
    // Ensure the date is rounded to 15-minute intervals
    const minutes = date.getMinutes();
    return minutes % 15 === 0;
  }, "Horário deve estar em intervalos de 15 minutos"),
  
  // Content
  summary: z.string()
    .max(500, "Resumo deve ter no máximo 500 caracteres")
    .optional(),
  
  // Media
  cover_url: z.string()
    .url("URL da capa deve ser uma URL válida")
    .optional(),
  cover_alt: z.string()
    .min(3, "Texto alternativo deve ter pelo menos 3 caracteres")
    .max(200, "Texto alternativo deve ter no máximo 200 caracteres")
    .optional(),
  cover_image: z.object({
    url: z.string().url("URL da imagem deve ser uma URL válida"),
    alt: z.string().min(1, "Texto alternativo é obrigatório"),
  }).optional(),
  
  // Agents - relacionamentos com entidades cadastradas
  organizer_id: z.string()
    .uuid("ID do organizador deve ser um UUID válido")
    .optional(),
  venue_id: z.string()
    .uuid("ID do local deve ser um UUID válido")
    .optional(),
  
  // Artists - multi-select de artistas cadastrados
  artist_ids: z.array(
    z.string().uuid("ID do artista deve ser um UUID válido")
  )
    .max(12, "Máximo 12 artistas cadastrados permitidos")
    .default([])
    .describe("IDs dos artistas cadastrados no sistema"),
  
  // Artists - apenas nomes como chips, sem criação automática
  artists_names: z.array(
    z.string()
      .min(1, "Nome do artista não pode estar vazio")
      .max(100, "Nome do artista deve ter no máximo 100 caracteres")
      .trim()
  )
    .max(12, "Máximo 12 artistas extras permitidos")
    .default([])
    .describe("Lista de nomes dos artistas extras - sem criação automática de registros"),
  
  // Links and tickets
  ticket_url: z.string()
    .url("URL do ingresso deve ser uma URL válida")
    .optional(),
  source_url: z.string()
    .url("URL da fonte deve ser uma URL válida")
    .optional(),
  
  // Location
  location_name: z.string()
    .max(200, "Nome do local deve ter no máximo 200 caracteres")
    .optional(),
  address: z.string()
    .max(300, "Endereço deve ter no máximo 300 caracteres")
    .optional(),
  neighborhood: z.string()
    .max(100, "Bairro deve ter no máximo 100 caracteres")
    .optional(),
  
  // Pricing
  price_min: z.number()
    .min(0, "Preço mínimo deve ser maior ou igual a 0")
    .optional(),
  price_max: z.number()
    .min(0, "Preço máximo deve ser maior ou igual a 0")
    .optional(),
  currency: z.string()
    .length(3, "Moeda deve ter 3 caracteres")
    .default("BRL"),
  
  // Status and visibility
  is_published: z.boolean().default(false),
  status: AgendaStatusEnum.default("draft"),
  priority: z.number()
    .int("Prioridade deve ser um número inteiro")
    .min(0, "Prioridade deve ser maior ou igual a 0")
    .max(100, "Prioridade deve ser menor ou igual a 100")
    .default(0),
  
  // Tags and metadata
  tags: z.array(
    z.string()
      .min(1, "Tag não pode estar vazia")
      .max(50, "Tag deve ter no máximo 50 caracteres")
  )
    .max(20, "Máximo 20 tags permitidas")
    .default([]),
  
  // SEO
  meta_title: z.string()
    .max(60, "Meta título deve ter no máximo 60 caracteres")
    .optional(),
  meta_description: z.string()
    .max(160, "Meta descrição deve ter no máximo 160 caracteres")
    .optional(),
  meta_image_url: z.string()
    .url("URL da meta imagem deve ser uma URL válida")
    .optional(),
  canonical_url: z.string()
    .url("URL canônica deve ser uma URL válida")
    .optional(),
  noindex: z.boolean().default(false),
  
  
  // Timestamps
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  deleted_at: z.date().optional(),
  publish_at: z.date().optional(),
  unpublish_at: z.date().optional(),
  
  // Additional fields
  patrocinado: z.boolean().default(false),
  age_rating: z.string()
    .max(50, "Classificação etária deve ter no máximo 50 caracteres")
    .optional(),
  ticket_status: z.string()
    .max(50, "Status do ingresso deve ter no máximo 50 caracteres")
    .optional(),
  cupom: z.string()
    .max(100, "Cupom deve ter no máximo 100 caracteres")
    .optional(),
  anunciante: z.string()
    .max(200, "Anunciante deve ter no máximo 200 caracteres")
    .optional(),
  editorial_notes: z.string()
    .max(1000, "Notas editoriais devem ter no máximo 1000 caracteres")
    .optional(),
  share_text: z.string()
    .max(280, "Texto de compartilhamento deve ter no máximo 280 caracteres")
    .optional(),
  accessibility: z.record(z.unknown()).default({}),
});

// Full schema with refinements and publishing rules
export const AgendaItemSchema = BaseAgendaItemSchema
.refine(
  (data) => {
    // End date must be after start date with at least 15 minutes difference
    if (data.end_at_utc && data.start_at_utc) {
      const diffMs = data.end_at_utc.getTime() - data.start_at_utc.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      return diffMinutes >= 15;
    }
    return true;
  },
  {
    message: "Data de fim deve ser pelo menos 15 minutos após o início",
    path: ["end_at_utc"]
  }
)
.refine(
  (data) => {
    // Cover image validation
    if (data.cover_url && !data.cover_alt) {
      return false;
    }
    if (data.cover_image && !data.cover_image.alt) {
      return false;
    }
    return true;
  },
  {
    message: "Texto alternativo é obrigatório quando há imagem de capa",
    path: ["cover_alt"]
  }
)
.refine(
  (data) => {
    if (data.price_min !== undefined && data.price_max !== undefined) {
      return data.price_max >= data.price_min;
    }
    return true;
  },
  {
    message: "Preço máximo deve ser maior ou igual ao preço mínimo",
    path: ["price_max"]
  }
)
.refine(
  (data) => {
    // Publishing rules for 'published' status
    if (data.status === 'published') {
      return !!(
        data.title &&
        data.city &&
        data.slug &&
        data.start_at_utc &&
        data.end_at_utc &&
        data.organizer_id &&
        data.venue_id
      );
    }
    return true;
  },
  {
    message: "Para publicar é obrigatório: título, cidade, slug, datas, organizador e local",
    path: ["status"]
  }
)
.refine(
  (data) => {
    // Publishing rules for 'scheduled' status
    if (data.status === 'scheduled') {
      return !!(
        data.title &&
        data.city &&
        data.slug &&
        data.start_at_utc &&
        data.end_at_utc
      );
    }
    return true;
  },
  {
    message: "Para agendar é obrigatório: título, cidade, slug e datas",
    path: ["status"]
  }
);

// Type inference
export type AgendaItemInput = z.infer<typeof AgendaItemSchema>;

// Partial schema for updates (using base schema)
export const AgendaItemUpdateSchema = BaseAgendaItemSchema.partial().omit({
  id: true,
  created_at: true,
});

export type AgendaItemUpdate = z.infer<typeof AgendaItemUpdateSchema>;

// Schema for creating new items (using base schema)
export const AgendaItemCreateSchema = BaseAgendaItemSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export type AgendaItemCreate = z.infer<typeof AgendaItemCreateSchema>;

// Simplified schema for public API (using base schema)
export const AgendaItemPublicSchema = BaseAgendaItemSchema.pick({
  id: true,
  title: true,
  slug: true,
  subtitle: true,
  city: true,
  start_at_utc: true,
  end_at_utc: true,
  cover_url: true,
  cover_alt: true,
  artists_names: true,
  ticket_url: true,
  summary: true,
  location_name: true,
  address: true,
  neighborhood: true,
  price_min: true,
  price_max: true,
  currency: true,
  tags: true,
  type: true,
  age_rating: true,
});

export type AgendaItemPublic = z.infer<typeof AgendaItemPublicSchema>;

// Utility function to validate slug format
export const validateSlug = (slug: string): boolean => {
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
};

// Utility function to generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Default error messages export
export const agendaErrorMessages = {
  title: {
    required: "Título é obrigatório",
    min: "Título deve ter pelo menos 3 caracteres",
    max: "Título deve ter no máximo 200 caracteres"
  },
  slug: {
    required: "Slug é obrigatório",
    min: "Slug deve ter pelo menos 3 caracteres",
    max: "Slug deve ter no máximo 100 caracteres",
    format: "Slug deve conter apenas letras minúsculas, números e hífens"
  },
  dates: {
    start_required: "Data de início é obrigatória",
    end_required: "Data de fim é obrigatória",
    end_after_start: "Data de fim deve ser pelo menos 15 minutos após o início"
  },
  artists: {
    max: "Máximo 12 artistas permitidos",
    empty_name: "Nome do artista não pode estar vazio"
  },
  cover: {
    alt_required: "Texto alternativo é obrigatório quando há imagem de capa",
    invalid_url: "URL da capa deve ser uma URL válida"
  },
  city: {
    required: "Cidade é obrigatória",
    invalid: "Cidade deve ser POA, FLORIPA, CURITIBA, SP ou RJ"
  }
};