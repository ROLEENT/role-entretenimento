import { useEffect, useCallback, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface AutosaveOptions {
  enabled?: boolean;
  delay?: number;
  onSave: () => Promise<void>;
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export const useAutosave = (
  data: any,
  { enabled = true, delay = 3000, onSave, onSaveSuccess, onSaveError }: AutosaveOptions
) => {
  const [debouncedData] = useDebounce(data, delay);
  const previousDataRef = useRef<any>(null);
  const [isAutosaving, setIsAutosaving] = useState(false);

  const performSave = useCallback(async () => {
    if (isAutosaving) return;
    
    try {
      setIsAutosaving(true);
      await onSave();
      onSaveSuccess?.();
    } catch (error) {
      console.error('Autosave failed:', error);
      onSaveError?.(error);
    } finally {
      setIsAutosaving(false);
    }
  }, [onSave, onSaveSuccess, onSaveError, isAutosaving]);

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
  };
};