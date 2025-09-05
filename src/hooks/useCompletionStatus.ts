import { useMemo } from 'react';
import { EventFormData } from '@/schemas/eventSchema';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';

// Define field weights for different types of content
export const VENUE_FIELD_WEIGHTS = {
  // Essential fields (higher weight)
  name: 15,
  about: 10,
  address_line: 8,
  city: 8,
  
  // Important fields
  phone: 6,
  email: 6,
  capacity: 6,
  cover_url: 8,
  
  // Contact & Social
  instagram: 4,
  website: 4,
  whatsapp: 4,
  
  // Media
  cover_alt: 3,
  gallery_urls: 5,
  
  // Details
  tags: 4,
  opening_hours: 6,
  
  // Features (lower individual weight but adds up)
  estruturas: 3,
  diferenciais: 3,
  bebidas: 2,
  cozinha: 2,
  acessibilidade: 4,
  seguranca: 3,
} as const;

export const EVENT_FIELD_WEIGHTS = {
  // Essential fields
  title: 15,
  starts_at: 12,
  city_id: 10,
  
  // Important fields
  excerpt: 8,
  content: 10,
  cover_url: 8,
  venue_id: 6,
  
  // Pricing & Details
  price_min: 4,
  price_max: 4,
  age_rating: 3,
  
  // Media & SEO
  gallery: 5,
  seo_title: 4,
  seo_description: 4,
  
  // Additional
  lineup: 6,
  links: 4,
  organizer_id: 3,
  ends_at: 3,
} as const;

type FieldPath = string;
type FieldValue = any;

// Helper to get nested field value
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper to check if a field has meaningful content
function hasContent(value: FieldValue): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    // For objects like opening_hours, check if any field has content
    return Object.values(value).some(v => hasContent(v));
  }
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'boolean') return value;
  return true;
}

// Calculate completion for a specific entity type
function calculateCompletion<T extends Record<string, any>>(
  data: T,
  weights: Record<string, number>
): {
  completedFields: string[];
  totalPossibleScore: number;
  currentScore: number;
  percentage: number;
  missingImportantFields: string[];
} {
  const completedFields: string[] = [];
  const missingImportantFields: string[] = [];
  let currentScore = 0;
  
  const totalPossibleScore = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  Object.entries(weights).forEach(([fieldPath, weight]) => {
    const value = getNestedValue(data, fieldPath);
    
    if (hasContent(value)) {
      completedFields.push(fieldPath);
      currentScore += weight;
    } else if (weight >= 6) { // Consider fields with weight >= 6 as important
      missingImportantFields.push(fieldPath);
    }
  });

  const percentage = Math.round((currentScore / totalPossibleScore) * 100);

  return {
    completedFields,
    totalPossibleScore,
    currentScore,
    percentage,
    missingImportantFields,
  };
}

// Hook for venue completion status
export function useVenueCompletionStatus(data: Partial<VenueFlexibleFormData>) {
  return useMemo(() => {
    const completion = calculateCompletion(data, VENUE_FIELD_WEIGHTS);
    
    const status: CompletionStatus = completion.percentage >= 80 ? 'complete' : completion.percentage >= 50 ? 'good' : 'incomplete';
    
    return {
      ...completion,
      status,
      recommendations: getVenueRecommendations(completion.missingImportantFields),
    };
  }, [data]);
}

// Hook for event completion status
export function useEventCompletionStatus(data: Partial<EventFormData>) {
  return useMemo(() => {
    const completion = calculateCompletion(data, EVENT_FIELD_WEIGHTS);
    
    const status: CompletionStatus = completion.percentage >= 80 ? 'complete' : completion.percentage >= 50 ? 'good' : 'incomplete';
    
    return {
      ...completion,
      status,
      recommendations: getEventRecommendations(completion.missingImportantFields),
    };
  }, [data]);
}

// Get human-readable recommendations for venues
function getVenueRecommendations(missingFields: string[]): string[] {
  const fieldLabels: Record<string, string> = {
    name: 'Nome do local',
    about: 'Descrição do espaço',
    address_line: 'Endereço completo',
    city: 'Cidade',
    phone: 'Telefone de contato',
    email: 'Email de contato',
    capacity: 'Capacidade do local',
    cover_url: 'Imagem de capa',
    instagram: 'Instagram',
    website: 'Website oficial',
    opening_hours: 'Horários de funcionamento',
    acessibilidade: 'Informações de acessibilidade',
  };

  return missingFields
    .map(field => fieldLabels[field])
    .filter(Boolean)
    .slice(0, 5); // Limit to top 5 recommendations
}

// Get human-readable recommendations for events
function getEventRecommendations(missingFields: string[]): string[] {
  const fieldLabels: Record<string, string> = {
    title: 'Título do evento',
    starts_at: 'Data e hora de início',
    city_id: 'Cidade do evento',
    excerpt: 'Resumo do evento',
    content: 'Descrição completa',
    cover_url: 'Imagem de capa',
    venue_id: 'Local do evento',
    price_min: 'Preço mínimo',
    lineup: 'Lineup de artistas',
    seo_title: 'Título para SEO',
    seo_description: 'Descrição para SEO',
  };

  return missingFields
    .map(field => fieldLabels[field])
    .filter(Boolean)
    .slice(0, 5); // Limit to top 5 recommendations
}

// Export completion status types
export type CompletionStatus = 'complete' | 'good' | 'incomplete';
export type CompletionInfo = {
  completedFields: string[];
  totalPossibleScore: number;
  currentScore: number;
  percentage: number;
  missingImportantFields: string[];
  status: CompletionStatus;
  recommendations: string[];
};