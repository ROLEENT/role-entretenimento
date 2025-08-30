export const cityToSlug = (cityName: string): string => {
  const slugMap: Record<string, string> = {
    'Porto Alegre': 'porto_alegre',
    'São Paulo': 'sao_paulo', 
    'Rio de Janeiro': 'rio_de_janeiro',
    'Florianópolis': 'florianopolis',
    'Curitiba': 'curitiba'
  };
  
  return slugMap[cityName] || cityName.toLowerCase().replace(/\s+/g, '_');
};

export const labelFromName = (cityName: string): string => {
  const labelMap: Record<string, string> = {
    'Porto Alegre': 'POA',
    'São Paulo': 'SP',
    'Rio de Janeiro': 'RJ', 
    'Florianópolis': 'Floripa',
    'Curitiba': 'Curitiba'
  };
  
  return labelMap[cityName] || cityName;
};