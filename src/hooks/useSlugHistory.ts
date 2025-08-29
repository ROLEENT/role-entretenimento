import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSlugHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveSlugChange = useCallback(async (agendaId: string, oldSlug: string) => {
    if (!oldSlug || !agendaId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('agenda_slug_history')
        .insert({
          agenda_id: agendaId,
          old_slug: oldSlug,
          changed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Redirecionamento configurado',
        description: `O link antigo (${oldSlug}) redirecionará automaticamente para o novo.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Erro ao salvar histórico de slug:', error);
      toast({
        title: 'Erro ao configurar redirecionamento',
        description: 'O histórico do slug não pôde ser salvo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getSlugHistory = useCallback(async (agendaId: string) => {
    try {
      const { data, error } = await supabase
        .from('agenda_slug_history')
        .select('*')
        .eq('agenda_id', agendaId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico de slug:', error);
      return [];
    }
  }, []);

  return {
    saveSlugChange,
    getSlugHistory,
    isLoading
  };
};