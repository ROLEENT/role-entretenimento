import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  location?: string;
  color: string;
  event_id?: string;
  reminder_minutes: number[];
  is_synced: boolean;
}

export interface CalendarSettings {
  id: string;
  google_calendar_enabled: boolean;
  google_calendar_id?: string;
  default_reminder_minutes: number;
  timezone: string;
  week_starts_on: number;
}

export const usePersonalCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [settings, setSettings] = useState<CalendarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar eventos do usuário
  const loadEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_datetime', { ascending: true });

      if (startDate) {
        query = query.gte('start_datetime', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('start_datetime', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      toast.error('Erro ao carregar eventos do calendário');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar configurações
  const loadSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_calendar_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      } else {
        // Criar configurações padrão
        const { data: newSettings, error: createError } = await supabase
          .from('user_calendar_settings')
          .insert({
            user_id: user.id,
            default_reminder_minutes: 15,
            timezone: 'America/Sao_Paulo',
            week_starts_on: 1
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    }
  }, [user]);

  // Adicionar evento
  const addEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .insert({
          ...eventData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      toast.success('Evento adicionado ao calendário!');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar evento');
      toast.error('Erro ao adicionar evento');
      return null;
    }
  }, [user]);

  // Atualizar evento
  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => prev.map(event => event.id === id ? data : event));
      toast.success('Evento atualizado!');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar evento');
      toast.error('Erro ao atualizar evento');
      return null;
    }
  }, [user]);

  // Deletar evento
  const deleteEvent = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      toast.success('Evento removido!');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar evento');
      toast.error('Erro ao remover evento');
      return false;
    }
  }, [user]);

  // Adicionar evento favoritado ao calendário
  const addFavoriteToCalendar = useCallback(async (eventId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .rpc('add_favorite_to_calendar', {
          p_user_id: user.id,
          p_event_id: eventId
        });

      if (error) throw error;

      await loadEvents();
      toast.success('Evento adicionado ao seu calendário!');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar ao calendário');
      toast.error('Erro ao adicionar evento ao calendário');
      return null;
    }
  }, [user, loadEvents]);

  // Atualizar configurações
  const updateSettings = useCallback(async (updates: Partial<CalendarSettings>) => {
    if (!user || !settings) return null;

    try {
      const { data, error } = await supabase
        .from('user_calendar_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      toast.success('Configurações atualizadas!');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
      toast.error('Erro ao atualizar configurações');
      return null;
    }
  }, [user, settings]);

  useEffect(() => {
    if (user) {
      loadSettings();
      loadEvents();
    }
  }, [user, loadSettings, loadEvents]);

  return {
    events,
    settings,
    loading,
    error,
    loadEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    addFavoriteToCalendar,
    updateSettings,
    clearError: () => setError(null)
  };
};