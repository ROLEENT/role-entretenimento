import { useEffect } from 'react';

export const useFormDirtyGuard = (isDirty: boolean, onNavigateAway: () => void) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        return (e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
};