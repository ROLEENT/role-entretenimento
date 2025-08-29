import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutosaveProps {
  data: any;
  onSave: (data: any) => Promise<void>;
  interval?: number;
  enabled?: boolean;
  isDraft?: boolean;
}

export const useAutosave = ({ 
  data, 
  onSave, 
  interval = 20000, // 20 seconds
  enabled = true,
  isDraft = true 
}: UseAutosaveProps) => {
  const { toast } = useToast();
  const lastSavedData = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSaving = useRef(false);

  const hasChanges = useCallback(() => {
    return JSON.stringify(data) !== JSON.stringify(lastSavedData.current);
  }, [data]);

  const performAutosave = useCallback(async () => {
    if (!enabled || !isDraft || isSaving.current || !hasChanges()) {
      return;
    }

    try {
      isSaving.current = true;
      await onSave(data);
      lastSavedData.current = JSON.parse(JSON.stringify(data));
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      
      toast({
        title: `Rascunho salvo ${timeString}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Erro no autosave:', error);
    } finally {
      isSaving.current = false;
    }
  }, [data, enabled, isDraft, hasChanges, onSave, toast]);

  useEffect(() => {
    if (!enabled || !isDraft) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(performAutosave, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, isDraft, interval, performAutosave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    hasChanges: hasChanges(),
    isSaving: isSaving.current,
    triggerSave: performAutosave
  };
};