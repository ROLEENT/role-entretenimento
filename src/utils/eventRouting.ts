import { ProfileEvent } from '@/features/profiles/hooks/useProfileEvents';

/**
 * Determina a URL correta para um evento baseado na sua origem
 */
export function getEventDetailUrl(event: ProfileEvent): string {
  // Se o evento tem source definido, usa para determinar a rota
  if (event.source) {
    return event.source === 'events' ? `/evento/${event.slug}` : `/agenda/${event.slug}`;
  }
  
  // Fallback: se tem event_id (vem da tabela events), usa /evento/
  if (event.event_id) {
    return `/evento/${event.slug}`;
  }
  
  // Fallback padrão: usa /agenda/ (para agenda_itens)
  return `/agenda/${event.slug}`;
}

/**
 * Verifica se um evento vem da tabela events
 */
export function isFromEventsTable(event: ProfileEvent): boolean {
  return event.source === 'events' || !!event.event_id;
}

/**
 * Gera URL de fallback se a primeira tentativa falhar
 */
export function getEventFallbackUrl(slug: string, currentPath: string): string {
  if (currentPath.startsWith('/agenda/')) {
    return `/evento/${slug}`;
  } else if (currentPath.startsWith('/evento/')) {
    return `/agenda/${slug}`;
  }
  return currentPath;
}