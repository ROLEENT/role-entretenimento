// lib/city-to-slug.ts
export function cityToSlug(name: string): string {
  const MAP: Record<string, string> = {
    'POA': 'porto_alegre',
    'Porto Alegre': 'porto_alegre',
    'SP': 'sao_paulo',
    'São Paulo': 'sao_paulo',
    'RJ': 'rio_de_janeiro',
    'Rio de Janeiro': 'rio_de_janeiro',
    'FLN': 'florianopolis',
    'Florianópolis': 'florianopolis',
    'CWB': 'curitiba',
    'Curitiba': 'curitiba',
  };
  const direct = MAP[name];
  if (direct) return direct;
  // fallback genérico
  return name
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/\s+/g, '_');
}

// Converter slug da URL para código da cidade no banco
export function slugToCityCode(slug: string): string {
  const MAP: Record<string, string> = {
    'porto_alegre': 'POA',
    'sao_paulo': 'SP', 
    'rio_de_janeiro': 'RJ',
    'florianopolis': 'FLN',
    'curitiba': 'CWB'
  };
  return MAP[slug] || slug;
}

export function labelFromName(name: string) {
  // use se quiser exibir POA, SP, RJ nos chips
  const map: Record<string,string> = {
    'Porto Alegre': 'POA',
    'São Paulo': 'SP',
    'Rio de Janeiro': 'RJ',
    'Florianópolis': 'Floripa',
    'Curitiba': 'Curitiba',
  };
  return map[name] ?? name;
}