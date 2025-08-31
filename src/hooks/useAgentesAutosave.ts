import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { syncArtistTypes, syncArtistGenres } from "@/utils/artistPivotSync";

interface UseAgentesAutosaveOptions {
  data: any;
  agentId?: string;
  tableName: string;
  isEditing: boolean;
  enabled: boolean;
  agentType?: string;
}

export function useAgentesAutosave({
  data,
  agentId,
  tableName,
  isEditing,
  enabled,
  agentType,
}: UseAgentesAutosaveOptions) {
  const debouncedData = useDebounce(data, 800);
  const lastSavedData = useRef<any>(null);

  const autosaveMutation = useMutation({
    mutationFn: async (saveData: any) => {
      const { artist_types, genres, ...agentData } = saveData;
      
      const processedData = {
        ...agentData,
        instagram: agentData.instagram ? agentData.instagram.replace(/^@+/, "").toLowerCase().trim() : null,
        updated_at: new Date().toISOString(),
      };

      let savedAgentId = agentId;

      if (isEditing && agentId) {
        const { error } = await supabase
          .from(tableName)
          .update(processedData)
          .eq("id", agentId);
        if (error) throw error;
      } else {
        // Para novos registros, cria um rascunho
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert({
            ...processedData,
            status: "draft",
          })
          .select('id')
          .single();
        if (error) throw error;
        savedAgentId = insertedData.id;
      }

      // Sincronizar pivôs apenas para artistas
      if (agentType === 'artistas' && savedAgentId) {
        if (artist_types) {
          await syncArtistTypes(savedAgentId, artist_types);
        }
        if (genres) {
          await syncArtistGenres(savedAgentId, genres);
        }
      }
    },
    onError: (error) => {
      console.error("Autosave error:", error);
    },
  });

  useEffect(() => {
    if (!enabled || !debouncedData) return;

    // Verificar se os dados mudaram
    const dataString = JSON.stringify(debouncedData);
    if (dataString === JSON.stringify(lastSavedData.current)) return;

    // Verificar se tem dados mínimos para salvar
    if (!debouncedData.name || debouncedData.name.length < 2) return;

    lastSavedData.current = debouncedData;
    autosaveMutation.mutate(debouncedData);
  }, [debouncedData, enabled, autosaveMutation]);

  return {
    isAutosaving: autosaveMutation.isPending,
  };
}