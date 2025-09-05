import { supabase } from "@/integrations/supabase/client";

/**
 * Utilitário para testar conectividade e debugging de eventos
 */
export const eventDebugUtils = {
  /**
   * Testa se a RPC create_event_cascade está acessível
   */
  async testCreateEventRPC() {
    try {
      console.log("🧪 Testando conectividade da RPC create_event_cascade...");
      
      const testData = {
        event_data: {
          title: "TESTE - Evento Debug",
          slug: `teste-debug-${Date.now()}`,
          status: "draft",
          city: "São Paulo",
          date_start: new Date().toISOString()
        },
        partners: [],
        lineup_slots: [],
        performances: [],
        visual_artists: []
      };

      const { data, error } = await supabase.rpc('create_event_cascade', testData);
      
      if (error) {
        console.error("❌ Erro no teste da RPC:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ RPC funcionando! ID do evento teste:", data);
      
      // Limpar o evento de teste
      if (data) {
        await supabase.from('events').delete().eq('id', data);
        console.log("🧹 Evento de teste removido");
      }

      return { success: true, eventId: data };
    } catch (error) {
      console.error("❌ Erro no teste de conectividade:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  /**
   * Valida dados de evento antes de enviar
   */
  validateEventData(eventData: any) {
    const errors: string[] = [];
    
    if (!eventData.title || eventData.title.trim() === '') {
      errors.push("Título é obrigatório");
    }
    
    if (!eventData.date_start) {
      errors.push("Data de início é obrigatória");
    }
    
    if (!eventData.city || eventData.city.trim() === '') {
      errors.push("Cidade é obrigatória");
    }

    // Verificar se slug existe, se não, gerar um
    if (!eventData.slug) {
      eventData.slug = eventData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'evento-sem-titulo';
    }

    console.log("🔍 Validação de dados do evento:", {
      isValid: errors.length === 0,
      errors,
      data: {
        title: eventData.title,
        slug: eventData.slug,
        city: eventData.city,
        date_start: eventData.date_start,
        status: eventData.status
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      cleanedData: eventData
    };
  },

  /**
   * Testa autenticação do usuário
   */
  async testUserAuth() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("❌ Erro na autenticação:", error);
        return { authenticated: false, error: error.message };
      }

      console.log("👤 Status de autenticação:", {
        authenticated: !!user,
        userId: user?.id,
        email: user?.email
      });

      return {
        authenticated: !!user,
        user: user
      };
    } catch (error) {
      console.error("❌ Erro ao verificar autenticação:", error);
      return { 
        authenticated: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  /**
   * Lista tabelas relacionadas a eventos para debug
   */
  async checkEventTables() {
    try {
      const tables = [
        'events',
        'event_partners', 
        'event_lineup_slots',
        'event_performances',
        'event_visual_artists'
      ];

      const results: Record<string, any> = {};

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

          results[table] = error ? 
            { error: error.message } : 
            { count };
        } catch (err) {
          results[table] = { 
            error: err instanceof Error ? err.message : 'Erro desconhecido' 
          };
        }
      }

      console.log("📊 Status das tabelas de eventos:", results);
      return results;
    } catch (error) {
      console.error("❌ Erro ao verificar tabelas:", error);
      return {};
    }
  }
};

// Exportar para uso em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  (window as any).eventDebugUtils = eventDebugUtils;
}