import { z } from "zod";

// Flexible venue schema with minimal required fields
export const venueFlexibleSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic info - only name is required
  name: z.string().min(2, "Nome é obrigatório"),
  slug: z.string().optional(), // Auto-generated
  
  // Address info - all optional
  address_line: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('BR'),
  
  // Geographic coordinates - optional
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Venue details - optional
  capacity: z.number().int().positive().optional(),
  
  // Structured data - all optional with defaults
  opening_hours: z.object({
    monday: z.string().default(""),
    tuesday: z.string().default(""),
    wednesday: z.string().default(""),
    thursday: z.string().default(""),
    friday: z.string().default(""),
    saturday: z.string().default(""),
    sunday: z.string().default(""),
  }).default({}),
  
  // Venue characteristics - all optional with defaults
  caracteristicas_estabelecimento: z.object({
    descricao: z.string().optional(),
  }).default({}),
  
  estruturas: z.object({
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
  }).default({}),
  
  diferenciais: z.object({
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
  }).default({}),
  
  bebidas: z.object({
    descricao: z.string().optional(),
    menu_cervejas: z.boolean().default(false),
    cervejas_artesanais: z.boolean().default(false),
    coqueteis_classicos: z.boolean().default(false),
    coqueteis_autorais: z.boolean().default(false),
    menu_vinhos: z.boolean().default(false),
  }).default({}),
  
  cozinha: z.object({
    descricao: z.string().optional(),
    serve_comida: z.boolean().default(false),
    opcoes_veganas: z.boolean().default(false),
    opcoes_vegetarianas: z.boolean().default(false),
    opcoes_sem_gluten: z.boolean().default(false),
    opcoes_sem_lactose: z.boolean().default(false),
    menu_kids: z.boolean().default(false),
  }).default({}),
  
  seguranca: z.object({
    descricao: z.string().optional(),
    equipe_seguranca: z.boolean().default(false),
    bombeiros_local: z.boolean().default(false),
    saidas_emergencia_sinalizadas: z.boolean().default(false),
  }).default({}),
  
  acessibilidade: z.object({
    descricao: z.string().optional(),
    elevador_acesso: z.boolean().default(false),
    rampa_cadeirantes: z.boolean().default(false),
    banheiro_acessivel: z.boolean().default(false),
    cardapio_braille: z.boolean().default(false),
    audio_acessivel: z.boolean().default(false),
    area_caes_guia: z.boolean().default(false),
  }).default({}),
  
  banheiros: z.object({
    descricao: z.string().optional(),
    masculinos: z.number().int().min(0).default(0),
    femininos: z.number().int().min(0).default(0),
    genero_neutro: z.number().int().min(0).default(0),
  }).default({}),
  
  // Contact info - all optional
  instagram: z.string().optional(),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional().or(z.literal('')),
  
  // Content - optional
  about: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // Media - all optional
  cover_url: z.string().optional(),
  cover_alt: z.string().optional(),
  gallery_urls: z.array(z.string()).default([]),
  
  // Metadata
  status: z.enum(['active', 'inactive']).default('active'),
  priority: z.number().int().default(0),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type VenueFlexibleFormData = z.infer<typeof venueFlexibleSchema>;