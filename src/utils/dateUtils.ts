/**
 * Utilitário para formatação de datas dos destaques
 * Trata datas como strings locais para evitar problemas de timezone
 */

/**
 * Formata data de destaque tratando como string local
 * Evita conversão de timezone que causa discrepância de 1 dia
 */
export const formatHighlightDate = (dateString?: string | null): string => {
  if (!dateString) return 'Data não informada';
  
  try {
    // Trata a data como string local, sem conversão de timezone
    const [year, month, day] = dateString.split('-').map(Number);
    
    if (!year || !month || !day) {
      return 'Data inválida';
    }
    
    // Cria data local sem conversão de timezone
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * Formata data de destaque para formato curto (dia de mês)
 */
export const formatHighlightDateShort = (dateString?: string | null): string => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    
    if (!year || !month || !day) {
      return '';
    }
    
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long'
    });
  } catch {
    return '';
  }
};

/**
 * Formata data de destaque para formato muito curto (dd MMM)
 */
export const formatHighlightDateVeryShort = (dateString?: string | null): string => {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    
    if (!year || !month || !day) {
      return '';
    }
    
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  } catch {
    return '';
  }
};

/**
 * Formata horário do evento para formato brasileiro
 */
export const formatEventTime = (timeString?: string | null): string => {
  if (!timeString) return '';
  
  try {
    // timeString está no formato HH:mm
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const min = parseInt(minutes);
    
    if (isNaN(hour) || isNaN(min)) return '';
    
    // Formatar para brasileiro: 20h, 20h30, etc.
    if (min === 0) {
      return `${hour}h`;
    } else {
      return `${hour}h${min.toString().padStart(2, '0')}`;
    }
  } catch {
    return '';
  }
};

/**
 * Formata data e horário juntos
 */
export const formatEventDateTime = (dateString?: string | null, timeString?: string | null): string => {
  const date = formatHighlightDateVeryShort(dateString);
  const time = formatEventTime(timeString);
  
  if (!date && !time) return '';
  if (!date) return time;
  if (!time) return date;
  
  return `${date} • ${time}`;
};