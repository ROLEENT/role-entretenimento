import { useEffect, useCallback, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';

interface AutosaveOptions {
  enabled?: boolean;
  delay?: number;
  onSave: () => Promise<void>;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
  onBlur?: () => void;
}

export const useAutosave = (
  data: any,
  { enabled = true, delay = 10000, onSave, onSaveSuccess, onSaveError, onBlur }: AutosaveOptions
) => {
  const [debouncedData] = useDebounce(data, delay);
  const previousDataRef = useRef<any>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const mutexRef = useRef(false);

  const performSave = useCallback(async () => {
    // Mutex to prevent parallel calls
    if (mutexRef.current || isAutosaving) return;
    
    try {
      mutexRef.current = true;
      setIsAutosaving(true);
      setHasError(false);
      
      await onSave();
      
      setLastSavedAt(new Date());
      onSaveSuccess?.();
    } catch (error) {
      console.error('Autosave failed:', error);
      setHasError(true);
      toast.error('Erro ao salvar automaticamente', {
        description: 'Verifique sua conexão e tente novamente.',
        action: {
          label: 'Tentar novamente',
          onClick: () => performSave(),
        },
      });
      onSaveError?.(error);
    } finally {
      setIsAutosaving(false);
      mutexRef.current = false;
    }
  }, [onSave, onSaveSuccess, onSaveError, isAutosaving]);

  const handleFieldBlur = useCallback(() => {
    if (enabled && onBlur) {
      onBlur();
    }
    performSave();
  }, [enabled, onBlur, performSave]);

  useEffect(() => {
    if (!enabled) return;
    
    // Skip first run or if data hasn't changed
    if (
      previousDataRef.current === null || 
      JSON.stringify(previousDataRef.current) === JSON.stringify(debouncedData)
    ) {
      previousDataRef.current = debouncedData;
      return;
    }

    previousDataRef.current = debouncedData;
    performSave();
  }, [debouncedData, enabled, performSave]);

  return {
    isAutosaving,
    hasError,
    lastSavedAt,
    handleFieldBlur,
    performSave,
  };
};