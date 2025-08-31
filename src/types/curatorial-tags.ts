// Sistema de tags para transparência curatorial

// Tipos de origem dos eventos
export const ORIGIN_TAGS = {
  // Curadoria interna
  "curadoria-equipe": {
    label: "Curadoria da Equipe",
    description: "Selecionado pela equipe editorial do Rolê",
    color: "orange",
    icon: "🎯"
  },
  "destaque-editorial": {
    label: "Destaque Editorial", 
    description: "Escolha destacada da redação",
    color: "amber",
    icon: "⭐"
  },
  
  // Comunidade
  "sugestao-comunidade": {
    label: "Sugestão da Comunidade",
    description: "Sugerido por nossos seguidores",
    color: "blue", 
    icon: "👥"
  },
  "indicacao-usuario": {
    label: "Indicação de Usuário",
    description: "Indicado por um usuário ativo",
    color: "cyan",
    icon: "👤"
  },
  
  // Parcerias
  "parceria-local": {
    label: "Parceria Local",
    description: "Evento de local parceiro",
    color: "green",
    icon: "🤝"
  },
  "colaboracao-artista": {
    label: "Colaboração com Artista",
    description: "Divulgação em colaboração com o artista",
    color: "purple",
    icon: "🎭"
  },
  
  // Automação/descoberta
  "descoberta-automatica": {
    label: "Descoberta Automática",
    description: "Encontrado por nosso sistema de descoberta",
    color: "gray",
    icon: "🤖"
  },
  "monitoramento-redes": {
    label: "Monitoramento de Redes",
    description: "Detectado através do monitoramento de redes sociais",
    color: "slate",
    icon: "📱"
  }
} as const;

// Tags de qualidade/verificação
export const QUALITY_TAGS = {
  "verificado-equipe": {
    label: "Verificado pela Equipe",
    description: "Informações verificadas pela nossa equipe",
    color: "emerald",
    icon: "✅"
  },
  "confirmado-organizador": {
    label: "Confirmado pelo Organizador", 
    description: "Informações confirmadas diretamente com o organizador",
    color: "teal",
    icon: "📞"
  },
  "fonte-oficial": {
    label: "Fonte Oficial",
    description: "Informações obtidas de fonte oficial",
    color: "indigo",
    icon: "🏛️"
  }
} as const;

// Tags de categorização curatorial
export const CURATORIAL_TAGS = {
  "diversidade-cultural": {
    label: "Diversidade Cultural",
    description: "Promove a diversidade e inclusão cultural",
    color: "rose",
    icon: "🌈"
  },
  "artista-emergente": {
    label: "Artista Emergente",
    description: "Destaca novos talentos da cena",
    color: "violet",
    icon: "🌱"
  },
  "cena-underground": {
    label: "Cena Underground",
    description: "Movimento cultural underground",
    color: "zinc",
    icon: "🔥"
  },
  "sustentabilidade": {
    label: "Sustentabilidade",
    description: "Evento com práticas sustentáveis",
    color: "lime",
    icon: "🌱"
  },
  "acessibilidade": {
    label: "Acessibilidade",
    description: "Evento acessível para pessoas com deficiência",
    color: "sky",
    icon: "♿"
  },
  "impacto-social": {
    label: "Impacto Social",
    description: "Evento com causa social relevante",
    color: "pink",
    icon: "❤️"
  }
} as const;

// União de todos os tipos de tags
export const ALL_TAGS = {
  ...ORIGIN_TAGS,
  ...QUALITY_TAGS,
  ...CURATORIAL_TAGS
} as const;

// Tipos TypeScript
export type OriginTagKey = keyof typeof ORIGIN_TAGS;
export type QualityTagKey = keyof typeof QUALITY_TAGS;
export type CuratorialTagKey = keyof typeof CURATORIAL_TAGS;
export type TagKey = keyof typeof ALL_TAGS;

export interface TagInfo {
  label: string;
  description: string;
  color: string;
  icon: string;
}

// Categorias de tags para organização
export const TAG_CATEGORIES = {
  origin: {
    label: "Origem",
    description: "Como descobrimos este evento",
    tags: ORIGIN_TAGS,
    required: true // Pelo menos uma tag de origem é obrigatória
  },
  quality: {
    label: "Verificação",
    description: "Nível de verificação das informações",
    tags: QUALITY_TAGS,
    required: false
  },
  curatorial: {
    label: "Curadoria",
    description: "Critérios curatoriais aplicados",
    tags: CURATORIAL_TAGS,
    required: false
  }
} as const;

// Função para obter informações de uma tag
export function getTagInfo(tagKey: string): TagInfo | null {
  return ALL_TAGS[tagKey as TagKey] || null;
}

// Função para obter cor Tailwind baseada na cor da tag
export function getTagColorClass(tagColor: string): string {
  const colorMap: Record<string, string> = {
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200", 
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
    green: "bg-green-100 text-green-800 border-green-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    slate: "bg-slate-100 text-slate-800 border-slate-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    teal: "bg-teal-100 text-teal-800 border-teal-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
    zinc: "bg-zinc-100 text-zinc-800 border-zinc-200",
    lime: "bg-lime-100 text-lime-800 border-lime-200",
    sky: "bg-sky-100 text-sky-800 border-sky-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200"
  };
  
  return colorMap[tagColor] || "bg-gray-100 text-gray-800 border-gray-200";
}

// Validação de tags
export function validateTags(tags: string[]): {
  isValid: boolean;
  errors: string[];
  hasOriginTag: boolean;
} {
  const errors: string[] = [];
  const hasOriginTag = tags.some(tag => tag in ORIGIN_TAGS);
  
  if (!hasOriginTag) {
    errors.push("Pelo menos uma tag de origem é obrigatória");
  }
  
  // Verificar se todas as tags existem
  const invalidTags = tags.filter(tag => !(tag in ALL_TAGS));
  if (invalidTags.length > 0) {
    errors.push(`Tags inválidas: ${invalidTags.join(", ")}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    hasOriginTag
  };
}