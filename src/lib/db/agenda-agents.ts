// Funções para migração futura entre agenda_itens e tabelas de agentes
// Não será usado na primeira versão - apenas para preparar ponte futura

export interface AgendaArtistRelation {
  agenda_id: string;
  artist_id: string;
  position: number;
  headliner: boolean;
  role?: string;
}

/**
 * Função para migração futura: criar artistas baseado nos nomes em agenda_itens.artists_names
 * Esta função será chamada apenas quando desejado fazer a migração dos dados
 * 
 * @param agendaId - ID do item da agenda
 * @param createMissing - Se deve criar artistas que não existem no banco
 * @returns Array de relações criadas
 */
export async function migrateAgendaArtists(
  agendaId: string, 
  createMissing: boolean = false
): Promise<AgendaArtistRelation[]> {
  // TODO: Implementar quando necessário
  // 1. Buscar agenda_item por ID
  // 2. Para cada nome em artists_names:
  //    - Verificar se artista existe na tabela artists (busca por nome similar)
  //    - Se createMissing=true e não existe, criar artista mínimo
  //    - Criar relação em agenda_item_artists
  // 3. Retornar array de relações criadas
  
  console.warn('migrateAgendaArtists: Função não implementada - será desenvolvida em etapa futura');
  return [];
}

/**
 * Função para limpar relações entre agenda e artistas
 * 
 * @param agendaId - ID do item da agenda
 */
export async function clearAgendaArtistRelations(agendaId: string): Promise<void> {
  // TODO: Implementar quando necessário
  // Deletar todas as relações em agenda_item_artists para o agendaId
  
  console.warn('clearAgendaArtistRelations: Função não implementada - será desenvolvida em etapa futura');
}

/**
 * Função para buscar artistas relacionados a um item da agenda
 * 
 * @param agendaId - ID do item da agenda
 * @returns Array de artistas relacionados
 */
export async function getAgendaArtists(agendaId: string): Promise<AgendaArtistRelation[]> {
  // TODO: Implementar quando necessário
  // Buscar relações em agenda_item_artists com JOIN na tabela artists
  
  console.warn('getAgendaArtists: Função não implementada - será desenvolvida em etapa futura');
  return [];
}

/**
 * Função para verificar se um artista existe pelo nome
 * 
 * @param artistName - Nome do artista para buscar
 * @returns ID do artista se encontrado, null caso contrário
 */
export async function findArtistByName(artistName: string): Promise<string | null> {
  // TODO: Implementar quando necessário
  // Buscar na tabela artists por stage_name similar (ILIKE ou fuzzy match)
  
  console.warn('findArtistByName: Função não implementada - será desenvolvida em etapa futura');
  return null;
}

/**
 * Função para criar artista mínimo baseado apenas no nome
 * 
 * @param artistName - Nome do artista
 * @returns ID do artista criado
 */
export async function createMinimalArtist(artistName: string): Promise<string> {
  // TODO: Implementar quando necessário
  // Criar artista na tabela artists com dados mínimos:
  // - stage_name = artistName
  // - slug = gerado do nome
  // - artist_type = "banda" (default)
  // - booking_email = placeholder
  // - booking_whatsapp = placeholder
  // - bio_short = "Artista criado automaticamente"
  // - profile_image_url = placeholder
  // - status = "inactive" (para revisar depois)
  
  console.warn('createMinimalArtist: Função não implementada - será desenvolvida em etapa futura');
  throw new Error('Função não implementada');
}