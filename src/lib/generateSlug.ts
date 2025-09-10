/**
 * Utility function to generate URL-friendly slugs from text
 */
export function generateSlugFromName(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'item-sem-nome';
  }
  
  return name
    .toLowerCase()
    .trim()
    // Remove acentos manualmente
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ý]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Remove caracteres especiais
    .replace(/[^a-z0-9\s-]/g, '')
    // Substitui espaços por hífens
    .replace(/\s+/g, '-')
    // Remove hífens múltiplos
    .replace(/-+/g, '-')
    // Remove hífens do início e fim
    .replace(/^-+|-+$/g, '');
}