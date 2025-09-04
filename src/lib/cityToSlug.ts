// lib/city-to-slug.ts

// Mapping from capital slugs to city codes (used for internal identification only)
export const capitalSlugToCode: Record<string, string> = {
  porto_alegre: 'POA',
  sao_paulo: 'SP', 
  rio_de_janeiro: 'RJ',
  florianopolis: 'FLN',
  curitiba: 'CWB'
};

// Convert city name to slug for URL usage
export function cityNameToSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // Remove accents
    .toLowerCase()
    .replace(/\s+/g, '_'); // Replace spaces with underscores
}

// Convert slug back to display name for UI
export function slugToCityName(slug: string): string {
  // First check if it's a capital
  const capitalNames: Record<string, string> = {
    porto_alegre: 'Porto Alegre',
    sao_paulo: 'São Paulo',
    rio_de_janeiro: 'Rio de Janeiro', 
    florianopolis: 'Florianópolis',
    curitiba: 'Curitiba'
  };
  
  if (capitalNames[slug]) {
    return capitalNames[slug];
  }
  
  // For other cities, convert underscore to space and capitalize
  return slug
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get the city name to use in database queries
export function getCityQueryValue(slug: string): string {
  // For capitals, return the full city name (not the code)
  // because the events table stores full city names
  const capitalNames: Record<string, string> = {
    porto_alegre: 'Porto Alegre',
    sao_paulo: 'São Paulo',
    rio_de_janeiro: 'Rio de Janeiro',
    florianopolis: 'Florianópolis',
    curitiba: 'Curitiba'
  };
  
  if (capitalNames[slug]) {
    return capitalNames[slug];
  }
  
  // For other cities, convert slug back to name
  return slugToCityName(slug);
}

// Check if slug represents a capital city
export function isCapitalSlug(slug: string): boolean {
  return slug in capitalSlugToCode;
}