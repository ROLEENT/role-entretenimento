import { z } from "zod";

// Enhanced artist schema with dynamic fields based on type
export const artistEnhancedSchema = z.object({
  id: z.string().uuid().optional(),
  
  // Basic Info - Required
  name: z.string().min(2, "Nome artístico é obrigatório").max(200, "Nome muito longo"),
  handle: z.string().min(3, "Handle deve ter pelo menos 3 caracteres").max(30, "Handle muito longo")
    .regex(/^[a-z0-9._-]+$/, "Handle deve conter apenas letras minúsculas, números, pontos, hífens e underscores"),
  slug: z.string().optional(), // Auto-generated from handle
  
  // Type and Categories - Required for dynamic fields
  type: z.enum(['dj', 'banda', 'performer', 'ator', 'fotografo', 'drag', 'visual', 'outro']),
  categories: z.array(z.string()).min(1, "Selecione pelo menos uma categoria"),
  genres: z.array(z.string()).default([]),
  
  // Location - Required city
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().optional(),
  country: z.string().default('Brasil'),
  
  // Bio - Required short bio
  bio_short: z.string().min(20, "Bio deve ter pelo menos 20 caracteres").max(500, "Bio muito longa"),
  bio_long: z.string().max(3000, "Bio longa muito extensa").optional(),
  
  // Contact - Required
  email: z.string().email("Email inválido").optional(),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  instagram: z.string().min(1, "Instagram é obrigatório"),
  
  // Professional Info by Type
  // DJ specific
  dj_style: z.string().optional(),
  equipment_needs: z.string().optional(),
  set_duration_min: z.number().int().positive().optional(),
  
  // Band specific  
  band_members: z.number().int().positive().optional(),
  instruments: z.array(z.string()).default([]),
  technical_rider: z.string().optional(),
  
  // Performer/Drag specific
  performance_type: z.array(z.string()).default([]),
  costume_requirements: z.string().optional(),
  special_needs: z.string().optional(),
  
  // Actor specific
  theater_experience: z.string().optional(),
  repertoire: z.array(z.string()).default([]),
  acting_styles: z.array(z.string()).default([]),
  
  // Photographer specific
  photography_style: z.array(z.string()).default([]),
  equipment_owned: z.string().optional(),
  portfolio_highlights: z.array(z.string()).default([]),
  
  // Media - Required main image
  profile_image_url: z.string().url("URL da imagem inválida"),
  profile_image_alt: z.string().min(5, "Descrição da imagem é obrigatória"),
  cover_image_url: z.string().url("URL inválida").optional(),
  cover_image_alt: z.string().optional(),
  gallery: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    caption: z.string().optional()
  })).default([]),
  
  // Links Externos - Instagram obrigatório
  links: z.object({
    instagram: z.string().min(1, "Instagram é obrigatório"),
    spotify: z.string().url("URL inválida").optional().or(z.literal('')),
    soundcloud: z.string().url("URL inválida").optional().or(z.literal('')),
    youtube: z.string().url("URL inválida").optional().or(z.literal('')),
    beatport: z.string().url("URL inválida").optional().or(z.literal('')),
    website: z.string().url("URL inválida").optional().or(z.literal('')),
    portfolio: z.string().url("URL inválida").optional().or(z.literal('')),
    facebook: z.string().url("URL inválida").optional().or(z.literal('')),
    tiktok: z.string().url("URL inválida").optional().or(z.literal('')),
    other: z.array(z.object({
      label: z.string(),
      url: z.string().url()
    })).default([])
  }),
  
  // Professional Details
  fee_range: z.enum(['ate-2k', '2k-5k', '5k-10k', '10k-mais', 'negociavel']).optional(),
  availability: z.object({
    days: z.array(z.enum(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'])).default([]),
    times: z.array(z.enum(['manha', 'tarde', 'noite', 'madrugada'])).default([]),
    cities: z.array(z.string()).default([])
  }).optional(),
  
  // Business Info
  booking_contact: z.object({
    name: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    role: z.string().optional()
  }).optional(),
  
  // Internal
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  priority: z.number().int().default(0),
  internal_notes: z.string().optional(),
  
  // Timestamps
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type-specific validation
export const validateArtistByType = (data: z.infer<typeof artistEnhancedSchema>) => {
  const errors: string[] = [];
  
  switch (data.type) {
    case 'dj':
      if (!data.dj_style) errors.push("Estilo é obrigatório para DJs");
      if (!data.set_duration_min) errors.push("Duração típica do set é obrigatória");
      break;
      
    case 'banda':
      if (!data.band_members) errors.push("Número de integrantes é obrigatório");
      if (data.instruments.length === 0) errors.push("Pelo menos um instrumento deve ser especificado");
      break;
      
    case 'fotografo':
      if (data.photography_style.length === 0) errors.push("Estilo fotográfico é obrigatório");
      if (!data.links.portfolio) errors.push("Link do portfólio é obrigatório para fotógrafos");
      break;
      
    case 'ator':
      if (data.acting_styles.length === 0) errors.push("Estilos de atuação são obrigatórios");
      break;
  }
  
  return errors;
};

export type ArtistEnhancedForm = z.infer<typeof artistEnhancedSchema>;

// Options for selects
export const ARTIST_TYPES = [
  { value: 'dj', label: 'DJ' },
  { value: 'banda', label: 'Banda' },
  { value: 'performer', label: 'Performer' },
  { value: 'ator', label: 'Ator/Atriz' },
  { value: 'fotografo', label: 'Fotógrafo' },
  { value: 'drag', label: 'Drag Queen/King' },
  { value: 'visual', label: 'Artista Visual' },
  { value: 'outro', label: 'Outro' },
];

export const ARTIST_CATEGORIES = [
  'DJ', 'Banda', 'Cantor(a)', 'Rapper', 'Funkeiro(a)', 'Performer', 
  'Drag Queen', 'Drag King', 'Ator', 'Atriz', 'Fotógrafo(a)', 
  'Videomaker', 'Artista Visual', 'Bailarino(a)', 'Produtor Musical'
];

export const MUSIC_GENRES = [
  'Techno', 'House', 'Funk', 'Rap', 'Pop', 'Rock', 'Indie', 'Electronic',
  'Trap', 'R&B', 'Soul', 'Jazz', 'Bossa Nova', 'MPB', 'Samba', 'Pagode',
  'Forró', 'Sertanejo', 'Reggae', 'Punk', 'Metal', 'Classical'
];

export const PERFORMANCE_GENRES = [
  'Teatro', 'Stand-up', 'Performance Art', 'Dança', 'Circo', 'Drag Show',
  'Burlesque', 'Cabaret', 'Música ao Vivo', 'Poetry Slam'
];

export const PHOTOGRAPHY_STYLES = [
  'Retrato', 'Evento', 'Moda', 'Street', 'Documental', 'Artística',
  'Produtos', 'Arquitetura', 'Paisagem', 'Lifestyle'
];