// lib/constants.ts
export const CITY_OPTIONS = ['POA','SP','RJ','FLN','CWB'] as const;

export const SECTION_OPTIONS = [
  'editorial','posfacio','dicas','fala_role','bpm','achadinhos','revista'
] as const;

export const STATUS_OPTIONS = ['rascunho','agendado','publicado'] as const;

// Utility to clean arrays and prevent empty values
export const clean = <T,>(arr: T[]) => arr.filter(v => v !== null && v !== undefined && String(v).trim() !== '');

// Helper to get display labels
export const getCityLabel = (value: string): string => {
  const labelMap: Record<string, string> = {
    'POA': 'Porto Alegre',
    'SP': 'São Paulo', 
    'RJ': 'Rio de Janeiro',
    'FLN': 'Florianópolis',
    'CWB': 'Curitiba'
  };
  return labelMap[value] || value;
};

export const getSectionLabel = (value: string): string => {
  const labelMap: Record<string, string> = {
    'editorial': 'Editorial',
    'posfacio': 'Posfácio',
    'dicas': 'Dicas',
    'fala_role': 'Fala ROLÊ',
    'bpm': 'BPM',
    'achadinhos': 'Achadinhos',
    'revista': 'Revista'
  };
  return labelMap[value] || value;
};

export const getStatusLabel = (value: string): string => {
  const labelMap: Record<string, string> = {
    'rascunho': 'Rascunho',
    'agendado': 'Agendado', 
    'publicado': 'Publicado'
  };
  return labelMap[value] || value;
};