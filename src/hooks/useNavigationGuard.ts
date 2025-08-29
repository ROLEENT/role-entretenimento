import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseNavigationGuardProps {
  hasUnsavedChanges: boolean;
  message?: string;
}

export const useNavigationGuard = ({ 
  hasUnsavedChanges, 
  message = 'Você tem alterações não salvas. Tem certeza que deseja sair?' 
}: UseNavigationGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Block browser navigation (back/forward/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Block React Router navigation
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const shouldLeave = window.confirm(message);
        if (!shouldLeave) {
          e.preventDefault();
          window.history.pushState(null, '', location.pathname + location.search);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', location.pathname + location.search);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, message, location]);

  const confirmNavigation = useCallback((path: string) => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm(message);
      if (shouldLeave) {
        navigate(path);
      }
      return shouldLeave;
    }
    navigate(path);
    return true;
  }, [hasUnsavedChanges, message, navigate]);

  return { confirmNavigation };
};