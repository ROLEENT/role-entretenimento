import { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

interface UseAutosaveProps<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutosave = <T>({ 
  data, 
  onSave, 
  delay = 800, 
  enabled = true 
}: UseAutosaveProps<T>) => {
  const [debouncedData] = useDebounce(data, delay);
  const previousDataRef = useRef<T>();
  const isFirstRun = useRef(true);

  const handleSave = useCallback(async () => {
    if (!enabled || isFirstRun.current) {
      isFirstRun.current = false;
      previousDataRef.current = debouncedData;
      return;
    }

    if (JSON.stringify(debouncedData) !== JSON.stringify(previousDataRef.current)) {
      try {
        await onSave(debouncedData);
        previousDataRef.current = debouncedData;
      } catch (error) {
        console.error('Erro no autosave:', error);
      }
    }
  }, [debouncedData, onSave, enabled]);

  useEffect(() => {
    handleSave();
  }, [handleSave]);

  return { isAutosaving: false }; // Could be enhanced with actual saving state
};