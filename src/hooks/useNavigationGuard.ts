import { useEffect, useCallback } from 'react';

export interface UseNavigationGuardProps {
  isDirty: boolean;
  message?: string;
  onBeforeNavigation?: () => boolean | Promise<boolean>;
}

export const useNavigationGuard = ({
  isDirty,
  message = 'Você tem alterações não salvas. Deseja sair mesmo assim?',
  onBeforeNavigation,
}: UseNavigationGuardProps) => {

  // Browser navigation guard (refresh, close tab, etc.)
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  // Internal navigation confirmation
  const confirmNavigation = useCallback(
    async (targetPath: string): Promise<boolean> => {
      if (!isDirty) return true;

      // Check with custom handler first
      if (onBeforeNavigation) {
        return await onBeforeNavigation();
      } else {
        // Default confirmation dialog
        return window.confirm(message);
      }
    },
    [isDirty, message, onBeforeNavigation]
  );

  return {
    confirmNavigation,
  };
};