export const COUNTRY_FLAGS: Record<string, string> = {
  'BR': '🇧🇷',
  'US': '🇺🇸',
  'UK': '🇬🇧',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'ES': '🇪🇸',
  'IT': '🇮🇹',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'MX': '🇲🇽',
  'AR': '🇦🇷',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'PE': '🇵🇪',
  'UY': '🇺🇾',
  'PY': '🇵🇾',
  'BO': '🇧🇴',
  'EC': '🇪🇨',
  'VE': '🇻🇪',
};

export const COUNTRY_NAMES: Record<string, string> = {
  'BR': 'Brasil',
  'US': 'Estados Unidos',
  'UK': 'Reino Unido',
  'CA': 'Canadá',
  'AU': 'Austrália',
  'DE': 'Alemanha',
  'FR': 'França',
  'ES': 'Espanha',
  'IT': 'Itália',
  'JP': 'Japão',
  'KR': 'Coreia do Sul',
  'MX': 'México',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colômbia',
  'PE': 'Peru',
  'UY': 'Uruguai',
  'PY': 'Paraguai',
  'BO': 'Bolívia',
  'EC': 'Equador',
  'VE': 'Venezuela',
};

export function getCountryDisplay(countryCode: string): string {
  const flag = COUNTRY_FLAGS[countryCode] || '🌍';
  const name = COUNTRY_NAMES[countryCode] || countryCode;
  return `${name} ${flag}`;
}

export function getCountryFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode] || '🌍';
}