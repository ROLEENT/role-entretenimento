import { z } from 'zod';

// Esquemas para as novas características detalhadas dos venues
const caracteristicasEstabelecimentoSchema = z.object({
  descricao: z.string().optional().nullable(),
});

const estruturasSchema = z.object({
  descricao: z.string().optional().nullable(),
  ar_condicionado: z.boolean().default(false),
  wifi: z.boolean().default(false),
  aquecimento: z.boolean().default(false),
  estacionamento: z.boolean().default(false),
  aceita_pets: z.boolean().default(false),
  area_fumantes: z.boolean().default(false),
  pista_danca: z.boolean().default(false),
  area_vip: z.boolean().default(false),
  rooftop: z.boolean().default(false),
  estacoes_carregamento: z.boolean().default(false),
  lugares_sentados: z.boolean().default(false),
});

const diferenciaisSchema = z.object({
  descricao: z.string().optional().nullable(),
  dj: z.boolean().default(false),
  happy_hour: z.boolean().default(false),
  mesa_bilhar: z.boolean().default(false),
  jogos_arcade: z.boolean().default(false),
  karaoke: z.boolean().default(false),
  narguile: z.boolean().default(false),
  transmissao_eventos_esportivos: z.boolean().default(false),
  shows_ao_vivo: z.boolean().default(false),
  stand_up: z.boolean().default(false),
  musica_ao_vivo: z.boolean().default(false),
  amigavel_lgbtqia: z.boolean().default(false),
});

const bebidasSchema = z.object({
  descricao: z.string().optional().nullable(),
  menu_cervejas: z.boolean().default(false),
  cervejas_artesanais: z.boolean().default(false),
  coqueteis_classicos: z.boolean().default(false),
  coqueteis_autorais: z.boolean().default(false),
  menu_vinhos: z.boolean().default(false),
});

const cozinhaSchema = z.object({
  descricao: z.string().optional().nullable(),
  serve_comida: z.boolean().default(false),
  opcoes_veganas: z.boolean().default(false),
  opcoes_vegetarianas: z.boolean().default(false),
  opcoes_sem_gluten: z.boolean().default(false),
  opcoes_sem_lactose: z.boolean().default(false),
  menu_kids: z.boolean().default(false),
});

const segurancaSchema = z.object({
  descricao: z.string().optional().nullable(),
  equipe_seguranca: z.boolean().default(false),
  bombeiros_local: z.boolean().default(false),
  saidas_emergencia_sinalizadas: z.boolean().default(false),
});

const acessibilidadeSchema = z.object({
  descricao: z.string().optional().nullable(),
  elevador_acesso: z.boolean().default(false),
  rampa_cadeirantes: z.boolean().default(false),
  banheiro_acessivel: z.boolean().default(false),
  cardapio_braille: z.boolean().default(false),
  audio_acessivel: z.boolean().default(false),
  area_caes_guia: z.boolean().default(false),
});

const banheirosSchema = z.object({
  descricao: z.string().optional().nullable(),
  masculinos: z.number().min(0).default(0),
  femininos: z.number().min(0).default(0),
  genero_neutro: z.number().min(0).default(0),
});

// Helper function to validate slug format
const validateSlugFormat = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Status enum
export const VenueStatus = z.enum(['active', 'inactive']);
export type VenueStatusType = z.infer<typeof VenueStatus>;

// Amenities schema - boolean object for venue features (manter para compatibilidade)
export const venueAmenitiesSchema = z.object({
  accessible: z.boolean().default(false),
  stage: z.boolean().default(false),
  sound: z.boolean().default(false),
  lighting: z.boolean().default(false),
  parking: z.boolean().default(false),
  food: z.boolean().default(false),
  smoking: z.boolean().default(false),
}).default({});

// Opening hours schema - object with short text for each day
export const venueOpeningHoursSchema = z.object({
  monday: z.string().max(20, "Horário muito longo").default(""),
  tuesday: z.string().max(20, "Horário muito longo").default(""),
  wednesday: z.string().max(20, "Horário muito longo").default(""),
  thursday: z.string().max(20, "Horário muito longo").default(""),
  friday: z.string().max(20, "Horário muito longo").default(""),
  saturday: z.string().max(20, "Horário muito longo").default(""),
  sunday: z.string().max(20, "Horário muito longo").default(""),
}).default({});

// Schema principal do venue atualizado
export const venueSchema = z.object({
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
  
  // Address info
  address_line: z.string()
    .max(300, "Endereço muito longo")
    .optional(),
  
  district: z.string()
    .max(100, "Bairro muito longo")
    .optional(),
  
  city: z.string()
    .max(100, "Cidade muito longa")
    .optional(),
  
  state: z.string()
    .max(50, "Estado muito longo")
    .optional(),
  
  postal_code: z.string()
    .max(20, "CEP muito longo")
    .optional(),
  
  country: z.string().default('BR'),
  
  // Geographic coordinates
  latitude: z.number()
    .min(-90, "Latitude inválida")
    .max(90, "Latitude inválida")
    .optional(),
  
  longitude: z.number()
    .min(-180, "Longitude inválida")
    .max(180, "Longitude inválida")
    .optional(),
  
  // Venue details
  capacity: z.number()
    .int("Capacidade deve ser um número inteiro")
    .positive("Capacidade deve ser positiva")
    .optional(),
  
  // Structured data (manter para compatibilidade)
  amenities: venueAmenitiesSchema,
  opening_hours: venueOpeningHoursSchema,
  
  // Contact info
  instagram: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal('')),
  
  // Content
  about: z.string().optional(),

  tags: z.array(z.string())
    .max(12, "Máximo de 12 tags permitidas")
    .default([]),

  // Media
  cover_url: z.string().optional(),
  cover_alt: z.string().optional(),
  gallery_urls: z.array(z.string()).default([]),
  
  // Metadata
  status: VenueStatus.default('active'),
  priority: z.number().int().default(0),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  
  // Novos campos de características detalhadas
  caracteristicas_estabelecimento: caracteristicasEstabelecimentoSchema.default({ descricao: null }),
  estruturas: estruturasSchema.default({
    descricao: null,
    ar_condicionado: false,
    wifi: false,
    aquecimento: false,
    estacionamento: false,
    aceita_pets: false,
    area_fumantes: false,
    pista_danca: false,
    area_vip: false,
    rooftop: false,
    estacoes_carregamento: false,
    lugares_sentados: false,
  }),
  diferenciais: diferenciaisSchema.default({
    descricao: null,
    dj: false,
    happy_hour: false,
    mesa_bilhar: false,
    jogos_arcade: false,
    karaoke: false,
    narguile: false,
    transmissao_eventos_esportivos: false,
    shows_ao_vivo: false,
    stand_up: false,
    musica_ao_vivo: false,
    amigavel_lgbtqia: false,
  }),
  bebidas: bebidasSchema.default({
    descricao: null,
    menu_cervejas: false,
    cervejas_artesanais: false,
    coqueteis_classicos: false,
    coqueteis_autorais: false,
    menu_vinhos: false,
  }),
  cozinha: cozinhaSchema.default({
    descricao: null,
    serve_comida: false,
    opcoes_veganas: false,
    opcoes_vegetarianas: false,
    opcoes_sem_gluten: false,
    opcoes_sem_lactose: false,
    menu_kids: false,
  }),
  seguranca: segurancaSchema.default({
    descricao: null,
    equipe_seguranca: false,
    bombeiros_local: false,
    saidas_emergencia_sinalizadas: false,
  }),
  acessibilidade: acessibilidadeSchema.default({
    descricao: null,
    elevador_acesso: false,
    rampa_cadeirantes: false,
    banheiro_acessivel: false,
    cardapio_braille: false,
    audio_acessivel: false,
    area_caes_guia: false,
  }),
  banheiros: banheirosSchema.default({
    descricao: null,
    masculinos: 0,
    femininos: 0,
    genero_neutro: 0,
  }),
}).refine(
  (data) => {
    // Custom validation: if cover_url is present, require cover_alt
    if (data.cover_url && !data.cover_alt) {
      return false;
    }
    return true;
  },
  {
    message: "Texto alternativo é obrigatório quando uma imagem de capa é fornecida",
    path: ["cover_alt"]
  }
);

export type VenueFormData = z.infer<typeof venueSchema>;
export type VenueAmenities = z.infer<typeof venueAmenitiesSchema>;
export type VenueOpeningHours = z.infer<typeof venueOpeningHoursSchema>;

// Tipos específicos para cada seção
export type CaracteristicasEstabelecimento = z.infer<typeof caracteristicasEstabelecimentoSchema>;
export type Estruturas = z.infer<typeof estruturasSchema>;
export type Diferenciais = z.infer<typeof diferenciaisSchema>;
export type Bebidas = z.infer<typeof bebidasSchema>;
export type Cozinha = z.infer<typeof cozinhaSchema>;
export type Seguranca = z.infer<typeof segurancaSchema>;
export type Acessibilidade = z.infer<typeof acessibilidadeSchema>;
export type Banheiros = z.infer<typeof banheirosSchema>;

// Export for form options
export const VENUE_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
] as const;

// Helper for amenities labels
export const AMENITIES_LABELS = {
  accessible: "Acessível",
  stage: "Palco",
  sound: "Sistema de Som",
  lighting: "Iluminação",
  parking: "Estacionamento",
  food: "Alimentação",
  smoking: "Área para Fumantes",
} as const;

// Helper for days labels
export const DAYS_LABELS = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
} as const;