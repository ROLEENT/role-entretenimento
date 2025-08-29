import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseNavigationGuardProps {
  when: boolean;
  message?: string;
}

export const useNavigationGuard = ({ 
  when, 
  message = 'Você tem alterações não salvas. Deseja realmente sair?' 
}: UseNavigationGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (when) {
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  }, [when, message]);

  useEffect(() => {
    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [when, handleBeforeUnload]);

  const confirmNavigation = useCallback((targetPath: string) => {
    if (when) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        navigate(targetPath);
      }
      return confirmed;
    }
    navigate(targetPath);
    return true;
  }, [when, message, navigate]);

  return { confirmNavigation };
};