// Constantes e lógica para categorias de artistas e gêneros dinâmicos

// Categorias de ATUAÇÃO (baseadas no banco de dados)
export const ACTING_CATEGORIES = [
  'drag-queen', 'drag-king', 'ator', 'atriz', 'performer', 'dancarino', 
  'comediante', 'transformista', 'artista-de-circo', 'poeta', 'slammer'
];

// Categorias MUSICAIS (baseadas no banco de dados)
export const MUSIC_CATEGORIES = [
  'dj', 'cantor', 'cantora', 'banda', 'produtor-musical', 'mc', 
  'instrumentista', 'dupla', 'grupo-musical', 'solista'
];

// Categorias MISTAS que podem ter ambos os tipos de gêneros
export const MIXED_CATEGORIES = [
  'companhia-de-danca', 'companhia-de-teatro', 'coletivo-artistico', 
  'interdisciplinar', 'duo'
];

// Sugestões de gêneros de atuação
export const ACTING_GENRE_SUGGESTIONS = [
  'drag performance', 'lipsync', 'dança', 'performance cênica', 'vogue', 
  'teatro musical', 'improviso', 'stand-up', 'burlesco', 'pole dance', 
  'clown', 'live art', 'teatro', 'tributos pop', 'performance experimental',
  'drag comedy', 'voguing', 'ballroom', 'transformismo'
];

// Sugestões de gêneros musicais  
export const MUSIC_GENRE_SUGGESTIONS = [
  'house', 'techno', 'funk', 'disco', 'pop', 'r&b', 'hip hop', 'trap', 
  'electro', 'itálo', 'garage', 'breaks', 'hard techno', 'ambient', 
  'deep house', 'tech house', 'minimal', 'progressive', 'trance', 'dnb',
  'jungle', 'dubstep', 'future bass', 'synthwave', 'indie', 'rock', 
  'alternative', 'jazz', 'blues', 'reggae', 'samba', 'bossa nova', 'mpb'
];

/**
 * Normaliza texto para comparação (remove acentos, converte para lowercase)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Determina o tipo de categoria baseado no slug/nome
 */
export function getCategoryType(categorySlug: string): 'acting' | 'music' | 'mixed' | 'unknown' {
  const normalized = normalizeText(categorySlug);
  
  if (ACTING_CATEGORIES.includes(normalized)) {
    return 'acting';
  }
  
  if (MUSIC_CATEGORIES.includes(normalized)) {
    return 'music';
  }
  
  if (MIXED_CATEGORIES.includes(normalized)) {
    return 'mixed';
  }
  
  return 'unknown';
}

/**
 * Verifica se deve mostrar campo de gêneros de atuação
 */
export function shouldShowActingGenres(categorySlug?: string): boolean {
  if (!categorySlug) return false;
  const type = getCategoryType(categorySlug);
  return type === 'acting' || type === 'mixed';
}

/**
 * Verifica se deve mostrar campo de gêneros musicais
 */
export function shouldShowMusicGenres(categorySlug?: string): boolean {
  if (!categorySlug) return false;
  const type = getCategoryType(categorySlug);
  return type === 'music' || type === 'mixed';
}

/**
 * Obtém sugestões para o campo baseado no tipo
 */
export function getGenreSuggestions(type: 'acting' | 'music'): string[] {
  return type === 'acting' ? ACTING_GENRE_SUGGESTIONS : MUSIC_GENRE_SUGGESTIONS;
}