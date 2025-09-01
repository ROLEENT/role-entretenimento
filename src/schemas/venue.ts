import { z } from "zod";

// Helper function to validate slug format
const validateSlugFormat = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Status enum
export const VenueStatus = z.enum(['active', 'inactive']);
export type VenueStatusType = z.infer<typeof VenueStatus>;

// Venue characteristics schemas
export const caracteristicasEstabelecimentoSchema = z.object({
  descricao: z.string().optional(),
}).default({});

export const estruturasSchema = z.object({
  descricao: z.string().optional(),
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
}).default({});

export const diferenciaisSchema = z.object({
  descricao: z.string().optional(),
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
}).default({});

export const bebidasSchema = z.object({
  descricao: z.string().optional(),
  menu_cervejas: z.boolean().default(false),
  cervejas_artesanais: z.boolean().default(false),
  coqueteis_classicos: z.boolean().default(false),
  coqueteis_autorais: z.boolean().default(false),
  menu_vinhos: z.boolean().default(false),
}).default({});

export const cozinhaSchema = z.object({
  descricao: z.string().optional(),
  serve_comida: z.boolean().default(false),
  opcoes_veganas: z.boolean().default(false),
  opcoes_vegetarianas: z.boolean().default(false),
  opcoes_sem_gluten: z.boolean().default(false),
  opcoes_sem_lactose: z.boolean().default(false),
  menu_kids: z.boolean().default(false),
}).default({});

export const segurancaSchema = z.object({
  descricao: z.string().optional(),
  equipe_seguranca: z.boolean().default(false),
  bombeiros_local: z.boolean().default(false),
  saidas_emergencia_sinalizadas: z.boolean().default(false),
}).default({});

export const acessibilidadeSchema = z.object({
  descricao: z.string().optional(),
  elevador_acesso: z.boolean().default(false),
  rampa_cadeirantes: z.boolean().default(false),
  banheiro_acessivel: z.boolean().default(false),
  cardapio_braille: z.boolean().default(false),
  audio_acessivel: z.boolean().default(false),
  area_caes_guia: z.boolean().default(false),
}).default({});

export const banheirosSchema = z.object({
  descricao: z.string().optional(),
  masculinos: z.number().int().min(0).default(0),
  femininos: z.number().int().min(0).default(0),
  genero_neutro: z.number().int().min(0).default(0),
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

// Venue schema
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
  
  // Structured data
  opening_hours: venueOpeningHoursSchema,
  
  // Venue characteristics
  caracteristicas_estabelecimento: caracteristicasEstabelecimentoSchema,
  estruturas: estruturasSchema,
  diferenciais: diferenciaisSchema,
  bebidas: bebidasSchema,
  cozinha: cozinhaSchema,
  seguranca: segurancaSchema,
  acessibilidade: acessibilidadeSchema,
  banheiros: banheirosSchema,
  
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
export type VenueOpeningHours = z.infer<typeof venueOpeningHoursSchema>;
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

// Labels for venue characteristics
export const ESTRUTURAS_LABELS = {
  ar_condicionado: "Ar Condicionado",
  wifi: "Wi-Fi",
  aquecimento: "Aquecimento",
  estacionamento: "Estacionamento",
  aceita_pets: "Aceita Pets",
  area_fumantes: "Área para Fumantes",
  pista_danca: "Pista de Dança",
  area_vip: "Área VIP",
  rooftop: "Rooftop",
  estacoes_carregamento: "Estações de Carregamento",
  lugares_sentados: "Lugares Sentados",
} as const;

export const DIFERENCIAIS_LABELS = {
  dj: "DJ",
  happy_hour: "Happy Hour",
  mesa_bilhar: "Mesa de Bilhar",
  jogos_arcade: "Jogos Arcade",
  karaoke: "Karaokê",
  narguile: "Narguilé",
  transmissao_eventos_esportivos: "Transmissão de Eventos Esportivos",
  shows_ao_vivo: "Shows ao Vivo",
  stand_up: "Stand Up",
  musica_ao_vivo: "Música ao Vivo",
  amigavel_lgbtqia: "Amigável LGBTQIA+",
} as const;

export const BEBIDAS_LABELS = {
  menu_cervejas: "Menu de Cervejas",
  cervejas_artesanais: "Cervejas Artesanais",
  coqueteis_classicos: "Coquetéis Clássicos",
  coqueteis_autorais: "Coquetéis Autorais",
  menu_vinhos: "Menu de Vinhos",
} as const;

export const COZINHA_LABELS = {
  serve_comida: "Serve Comida",
  opcoes_veganas: "Opções Veganas",
  opcoes_vegetarianas: "Opções Vegetarianas",
  opcoes_sem_gluten: "Opções sem Glúten",
  opcoes_sem_lactose: "Opções sem Lactose",
  menu_kids: "Menu Kids",
} as const;

export const SEGURANCA_LABELS = {
  equipe_seguranca: "Equipe de Segurança",
  bombeiros_local: "Bombeiros no Local",
  saidas_emergencia_sinalizadas: "Saídas de Emergência Sinalizadas",
} as const;

export const ACESSIBILIDADE_LABELS = {
  elevador_acesso: "Elevador de Acesso",
  rampa_cadeirantes: "Rampa para Cadeirantes",
  banheiro_acessivel: "Banheiro Acessível",
  cardapio_braille: "Cardápio em Braille",
  audio_acessivel: "Áudio Acessível",
  area_caes_guia: "Área para Cães-Guia",
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