import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
type AttendanceStatus = 'going' | 'maybe' | 'went';

interface SaveState {
  saved: boolean;
  loading: boolean;
}

interface AttendanceState {
  status: AttendanceStatus | null;
  loading: boolean;
}

interface FollowState {
  following: boolean;
  loading: boolean;
}

export const useSocialActions = () => {
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [attendanceStates, setAttendanceStates] = useState<Record<string, AttendanceState>>({});
  const [followStates, setFollowStates] = useState<Record<string, FollowState>>({});

  const toggleSave = async (eventId: string, collection = 'default') => {
    const key = `${eventId}-${collection}`;
    setSaveStates(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }));

    try {
      const { data, error } = await supabase
        .rpc('toggle_save', { event_id: eventId, collection });

      if (error) throw error;

      const saved = data?.[0]?.saved || false;
      setSaveStates(prev => ({ ...prev, [key]: { saved, loading: false } }));

      toast({
        description: saved ? "Evento salvo!" : "Evento removido dos salvos",
      });

      return saved;
    } catch (error) {
      setSaveStates(prev => ({ ...prev, [key]: { ...prev[key], loading: false } }));
      toast({
        title: "Erro",
        description: "Falha ao salvar evento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const setAttendance = async (eventId: string, status: AttendanceStatus, showPublicly = true) => {
    setAttendanceStates(prev => ({ ...prev, [eventId]: { ...prev[eventId], loading: true } }));

    try {
      const { error } = await supabase
        .rpc('set_attendance', {
          p_event_id: eventId,
          p_status: status,
          p_show_publicly: showPublicly
        });

      if (error) throw error;

      setAttendanceStates(prev => ({ ...prev, [eventId]: { status, loading: false } }));

      const statusLabels = {
        going: "Confirmei presença!",
        maybe: "Marquei como talvez",
        went: "Marquei como fui"
      };

      toast({
        description: statusLabels[status],
      });
    } catch (error) {
      setAttendanceStates(prev => ({ ...prev, [eventId]: { ...prev[eventId], loading: false } }));
      toast({
        title: "Erro",
        description: "Falha ao definir presença",
        variant: "destructive"
      });
      throw error;
    }
  };

  const toggleFollow = async (
    entityType: string,
    entityUuid?: string,
    entitySlug?: string
  ) => {
    const key = `${entityType}-${entityUuid || entitySlug}`;
    setFollowStates(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }));

    try {
      const { data, error } = await supabase
        .rpc('toggle_follow', {
          p_entity_type: entityType,
          p_entity_uuid: entityUuid || null,
          p_entity_slug: entitySlug || null
        });

      if (error) throw error;

      const following = data?.[0]?.following || false;
      setFollowStates(prev => ({ ...prev, [key]: { following, loading: false } }));

      toast({
        description: following ? "Seguindo!" : "Deixou de seguir",
      });

      return following;
    } catch (error) {
      setFollowStates(prev => ({ ...prev, [key]: { ...prev[key], loading: false } }));
      toast({
        title: "Erro",
        description: "Falha ao seguir/deixar de seguir",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    // Save actions
    toggleSave,
    saveStates,
    getSaveState: (eventId: string, collection = 'default') => 
      saveStates[`${eventId}-${collection}`] || { saved: false, loading: false },

    // Attendance actions
    setAttendance,
    attendanceStates,
    getAttendanceState: (eventId: string) => 
      attendanceStates[eventId] || { status: null, loading: false },

    // Follow actions
    toggleFollow,
    followStates,
    getFollowState: (entityType: string, entityUuid?: string, entitySlug?: string) => {
      const key = `${entityType}-${entityUuid || entitySlug}`;
      return followStates[key] || { following: false, loading: false };
    }
  };
};