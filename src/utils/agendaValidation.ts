export const validateUrl = (url: string | undefined | null, fieldName: string = 'URL'): string | null => {
  if (!url || url.trim() === '') return null;
  
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `${fieldName} deve começar com http:// ou https://`;
  }
  
  try {
    new URL(trimmedUrl);
    return null;
  } catch {
    return `${fieldName} deve ser uma URL válida`;
  }
};

export const validatePriceRange = (priceMin: number | undefined | null, priceMax: number | undefined | null): string | null => {
  if (priceMin == null || priceMax == null) return null;
  
  if (priceMax < priceMin) {
    return 'Preço máximo deve ser maior ou igual ao preço mínimo';
  }
  
  return null;
};

export const validateOccurrence = (startAt: string | undefined, endAt: string | undefined): string | null => {
  if (!startAt || !endAt) return null;
  
  try {
    const start = new Date(startAt);
    const end = new Date(endAt);
    
    if (start >= end) {
      return 'Data de fim deve ser posterior à data de início';
    }
    
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    if (diffMinutes < 15) {
      return 'Duração mínima de 15 minutos';
    }
    
    return null;
  } catch {
    return 'Datas inválidas';
  }
};

export const validateTicketTier = (tier: any): string[] => {
  const errors: string[] = [];
  
  if (!tier.name || tier.name.trim() === '') {
    errors.push('Nome do tier é obrigatório');
  }
  
  if (tier.price <= 0) {
    errors.push('Preço deve ser maior que zero');
  }
  
  if (tier.link && validateUrl(tier.link, 'Link do tier')) {
    errors.push(validateUrl(tier.link, 'Link do tier')!);
  }
  
  return errors;
};

export const getPublishValidationErrors = (formData: any): string[] => {
  const errors: string[] = [];
  
  // Required fields for publishing
  if (!formData.item?.title?.trim()) {
    errors.push('Título é obrigatório');
  }
  
  if (!formData.item?.slug?.trim()) {
    errors.push('Slug é obrigatório');
  }
  
  if (!formData.item?.city?.trim()) {
    errors.push('Cidade é obrigatória');
  }
  
  if (!formData.item?.start_at) {
    errors.push('Data de início é obrigatória');
  }
  
  if (!formData.item?.end_at) {
    errors.push('Data de fim é obrigatória');
  }
  
  if (!formData.item?.cover_url?.trim()) {
    errors.push('Capa é obrigatória');
  }
  
  if (!formData.item?.alt_text?.trim()) {
    errors.push('Texto alternativo da capa é obrigatório');
  }
  
  if (!formData.item?.summary?.trim() || formData.item.summary.length < 10) {
    errors.push('Resumo de pelo menos 10 caracteres é obrigatório');
  }
  
  // Date validation
  if (formData.item?.start_at && formData.item?.end_at) {
    const dateError = validateOccurrence(formData.item.start_at, formData.item.end_at);
    if (dateError) {
      errors.push(dateError);
    }
  }
  
  // Price range validation
  if (formData.item?.price_min != null && formData.item?.price_max != null) {
    const priceError = validatePriceRange(formData.item.price_min, formData.item.price_max);
    if (priceError) {
      errors.push(priceError);
    }
  }
  
  // URL validations
  if (formData.item?.ticket_url) {
    const ticketUrlError = validateUrl(formData.item.ticket_url, 'URL de ingressos');
    if (ticketUrlError) {
      errors.push(ticketUrlError);
    }
  }
  
  if (formData.item?.source_url) {
    const sourceUrlError = validateUrl(formData.item.source_url, 'URL de origem');
    if (sourceUrlError) {
      errors.push(sourceUrlError);
    }
  }
  
  // Occurrences validation
  if (formData.occurrences) {
    formData.occurrences.forEach((occurrence: any, index: number) => {
      const occError = validateOccurrence(occurrence.start_at, occurrence.end_at);
      if (occError) {
        errors.push(`Ocorrência ${index + 1}: ${occError}`);
      }
    });
  }
  
  // Ticket tiers validation
  if (formData.ticket_tiers) {
    formData.ticket_tiers.forEach((tier: any, index: number) => {
      const tierErrors = validateTicketTier(tier);
      tierErrors.forEach(error => {
        errors.push(`Tier ${index + 1}: ${error}`);
      });
    });
  }
  
  return errors;
};