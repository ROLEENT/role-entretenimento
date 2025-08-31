import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

interface UseAgentesAutosaveOptions {
  data: any;
  agentId?: string;
  tableName: string;
  isEditing: boolean;
  enabled: boolean;
}

export function useAgentesAutosave({
  data,
  agentId,
  tableName,
  isEditing,
  enabled,
}: UseAgentesAutosaveOptions) {
  const debouncedData = useDebounce(data, 800);
  const lastSavedData = useRef<any>(null);

  const autosaveMutation = useMutation({
    mutationFn: async (saveData: any) => {
      const processedData = {
        ...saveData,
        instagram: saveData.instagram ? saveData.instagram.replace(/^@+/, "").toLowerCase().trim() : null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && agentId) {
        const { error } = await supabase
          .from(tableName)
          .update(processedData)
          .eq("id", agentId);
        if (error) throw error;
      } else {
        // Para novos registros, cria um rascunho
        const { error } = await supabase
          .from(tableName)
          .insert({
            ...processedData,
            status: "draft",
          });
        if (error) throw error;
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