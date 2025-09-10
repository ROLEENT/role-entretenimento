// Validation function for auto-publishing events
export function canPublish(values: any): boolean {
  // Required fields for publication
  const hasTitle = !!(values.title && values.title.trim().length > 0);
  const hasSlug = !!(values.slug && values.slug.trim().length > 0);
  const hasCity = !!(values.city && values.city.trim().length > 0);
  const hasStartDate = !!values.date_start;
  const hasEndDate = !!values.date_end;
  const hasCoverAlt = !!(values.cover_alt && values.cover_alt.trim().length > 0);
  const hasCover = !!(values.cover_url || values.image_url);

  return hasTitle && hasSlug && hasCity && hasStartDate && hasEndDate && hasCoverAlt && hasCover;
}

// Get list of missing requirements for publication
export function getPublicationRequirements(values: any): string[] {
  const requirements: string[] = [];

  if (!values.title || values.title.trim().length === 0) {
    requirements.push('Título');
  }
  
  if (!values.slug || values.slug.trim().length === 0) {
    requirements.push('Slug único');
  }
  
  if (!values.city || values.city.trim().length === 0) {
    requirements.push('Cidade');
  }
  
  if (!values.date_start) {
    requirements.push('Data de início');
  }
  
  if (!values.date_end) {
    requirements.push('Data de fim');
  }
  
  if (!values.cover_alt || values.cover_alt.trim().length === 0) {
    requirements.push('Texto alternativo da capa');
  }
  
  if (!values.cover_url && !values.image_url) {
    requirements.push('Imagem de capa');
  }

  return requirements;
}