// Constantes para formulários - opções pré-definidas

export const ARTIST_TYPES = [
  { value: 'dj', label: 'DJ' },
  { value: 'banda', label: 'Banda' },
  { value: 'cantor', label: 'Cantor/Cantora' },
  { value: 'duo', label: 'Duo' },
  { value: 'trio', label: 'Trio' },
  { value: 'grupo', label: 'Grupo' },
  { value: 'orquestra', label: 'Orquestra' },
  { value: 'outro', label: 'Outro' },
];

export const ARTIST_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export const VENUE_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'pending', label: 'Pendente' },
];

export const EVENT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const ORGANIZER_STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export const VENUE_CAPACITY_RANGES = [
  { value: 'até-50', label: 'Até 50 pessoas' },
  { value: '51-100', label: '51 a 100 pessoas' },
  { value: '101-200', label: '101 a 200 pessoas' },
  { value: '201-500', label: '201 a 500 pessoas' },
  { value: '501-1000', label: '501 a 1.000 pessoas' },
  { value: '1001+', label: 'Mais de 1.000 pessoas' },
];

export const FEE_RANGES = [
  { value: 'até-500', label: 'Até R$ 500' },
  { value: '500-1000', label: 'R$ 500 a R$ 1.000' },
  { value: '1000-2500', label: 'R$ 1.000 a R$ 2.500' },
  { value: '2500-5000', label: 'R$ 2.500 a R$ 5.000' },
  { value: '5000-10000', label: 'R$ 5.000 a R$ 10.000' },
  { value: '10000+', label: 'Acima de R$ 10.000' },
  { value: 'a-combinar', label: 'A combinar' },
];

export const SHOW_FORMATS = [
  { value: 'solo', label: 'Solo' },
  { value: 'duo', label: 'Duo' },
  { value: 'trio', label: 'Trio' },
  { value: 'banda-completa', label: 'Banda Completa' },
  { value: 'acustico', label: 'Acústico' },
  { value: 'eletronico', label: 'Eletrônico' },
  { value: 'hibrido', label: 'Híbrido' },
];

export const WEEKDAYS = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

// Helper functions para converter opções
export const optionsToSelect = <T extends { value: string; label: string }>(
  options: T[]
) => options.map(opt => ({ value: opt.value, label: opt.label }));

export const getOptionLabel = <T extends { value: string; label: string }>(
  options: T[],
  value: string
) => options.find(opt => opt.value === value)?.label || value;