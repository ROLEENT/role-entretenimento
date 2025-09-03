import { supabase } from '@/integrations/supabase/client';
import { adaptAgendaItemToEvent } from '@/components/events/adapters';
import type { Database } from '@/integrations/supabase/types';

type AgendaItem = Database['public']['Tables']['agenda_itens']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

/**
 * Script de migração de agenda_itens para events
 * Converte dados da estrutura antiga para a nova estrutura completa
 */
export class EventMigrationService {
  private async getAgendaItems(limit = 100, offset = 0): Promise<AgendaItem[]> {
    const { data, error } = await supabase
      .from('agenda_itens')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async checkEventExists(slug: string): Promise<boolean> {
    const { data } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();

    return !!data;
  }

  private async migrateAgendaItem(agendaItem: AgendaItem): Promise<string | null> {
    try {
      // Verificar se já existe
      const exists = await this.checkEventExists(agendaItem.slug);
      if (exists) {
        console.log(`Evento ${agendaItem.slug} já migrado`);
        return null;
      }

      // Adaptar dados
      const eventData = adaptAgendaItemToEvent(agendaItem);

      // Usar função RPC para criar evento completo
      const { data, error } = await supabase.rpc('create_event_cascade', {
        event_data: eventData,
        partners: [],
        lineup_slots: [],
        performances: [],
        visual_artists: []
      });

      if (error) throw error;

      console.log(`✅ Migrado evento: ${agendaItem.title} -> ${data}`);
      return data;
    } catch (error) {
      console.error(`❌ Erro ao migrar ${agendaItem.title}:`, error);
      return null;
    }
  }

  async migrateAll(batchSize = 50): Promise<{
    total: number;
    migrated: number;
    errors: number;
  }> {
    let offset = 0;
    let total = 0;
    let migrated = 0;
    let errors = 0;

    console.log('🚀 Iniciando migração de eventos...');

    while (true) {
      const items = await this.getAgendaItems(batchSize, offset);
      if (items.length === 0) break;

      console.log(`📦 Processando lote ${offset / batchSize + 1} (${items.length} itens)`);

      for (const item of items) {
        total++;
        const result = await this.migrateAgendaItem(item);
        if (result) {
          migrated++;
        } else {
          errors++;
        }
      }

      offset += batchSize;
      
      // Pausa entre lotes para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const summary = { total, migrated, errors };
    console.log('📊 Migração concluída:', summary);
    
    return summary;
  }

  async validateMigration(): Promise<{
    agendaCount: number;
    eventsCount: number;
    missingEvents: string[];
  }> {
    console.log('🔍 Validando migração...');

    // Contar agenda_itens
    const { count: agendaCount } = await supabase
      .from('agenda_itens')
      .select('*', { count: 'exact', head: true });

    // Contar events
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Verificar slugs faltantes
    const { data: agendaSlugs } = await supabase
      .from('agenda_itens')
      .select('slug')
      .order('created_at');

    const { data: eventSlugs } = await supabase
      .from('events')
      .select('slug')
      .order('created_at');

    const agendaSlugSet = new Set(agendaSlugs?.map(item => item.slug) || []);
    const eventSlugSet = new Set(eventSlugs?.map(event => event.slug) || []);

    const missingEvents = Array.from(agendaSlugSet).filter(slug => !eventSlugSet.has(slug));

    const result = {
      agendaCount: agendaCount || 0,
      eventsCount: eventsCount || 0,
      missingEvents
    };

    console.log('📊 Resultado da validação:', result);
    return result;
  }

  async cleanupDuplicates(): Promise<number> {
    console.log('🧹 Removendo duplicatas...');

    const { data: duplicates } = await supabase
      .from('events')
      .select('slug, id, created_at')
      .order('slug, created_at');

    if (!duplicates) return 0;

    const slugGroups: Record<string, typeof duplicates> = {};
    duplicates.forEach(event => {
      if (!slugGroups[event.slug]) slugGroups[event.slug] = [];
      slugGroups[event.slug].push(event);
    });

    let removed = 0;
    for (const [slug, events] of Object.entries(slugGroups)) {
      if (events.length > 1) {
        // Manter o mais recente, remover os outros
        const [latest, ...older] = events.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        for (const event of older) {
          const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', event.id);

          if (!error) {
            console.log(`🗑️ Removido evento duplicado: ${slug} (${event.id})`);
            removed++;
          }
        }
      }
    }

    console.log(`✅ Removidas ${removed} duplicatas`);
    return removed;
  }
}

// Função para executar migração via console
export const runMigration = async () => {
  const migrationService = new EventMigrationService();
  
  try {
    // 1. Executar migração
    const result = await migrationService.migrateAll();
    
    // 2. Validar resultado
    const validation = await migrationService.validateMigration();
    
    // 3. Limpar duplicatas se necessário
    if (validation.eventsCount > validation.agendaCount) {
      await migrationService.cleanupDuplicates();
    }
    
    console.log('🎉 Migração completa!', { result, validation });
    return { result, validation };
  } catch (error) {
    console.error('💥 Erro na migração:', error);
    throw error;
  }
};