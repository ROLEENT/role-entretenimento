import { useEffect } from 'react';
import { useSecureAuth } from './useSecureAuth';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para monitorar a sessão de autenticação e alertar sobre problemas
 */
export const useAuthSessionMonitor = () => {
  const { isAuthenticated, isSessionValid, refreshAuth, logout } = useSecureAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionHealth = async () => {
      if (!isSessionValid()) {
        console.warn('[SESSION MONITOR] Sessão inválida detectada');
        
        try {
          await refreshAuth();
          console.log('[SESSION MONITOR] Sessão renovada com sucesso');
        } catch (error) {
          console.error('[SESSION MONITOR] Falha ao renovar sessão:', error);
          
          toast({
            title: "Sessão Expirada",
            description: "Sua sessão expirou. Por favor, faça login novamente.",
            variant: "destructive"
          });
          
          // Force logout and redirect to login
          await logout();
          window.location.href = '/admin-v2/login';
        }
      }
    };

    // Check session health every 2 minutes
    const interval = setInterval(checkSessionHealth, 2 * 60 * 1000);

    // Check immediately
    checkSessionHealth();

    return () => clearInterval(interval);
  }, [isAuthenticated, isSessionValid, refreshAuth, logout]);

  // Monitor for auth errors in network requests
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      console.error('[SESSION MONITOR] Auth error detectado:', event.detail);
      
      toast({
        title: "Erro de Autenticação",
        description: "Detectamos um problema com sua sessão. Tentando resolver...",
        variant: "destructive"
      });
      
      // Try to refresh auth
      refreshAuth().catch(() => {
        console.error('[SESSION MONITOR] Não foi possível resolver erro de auth');
        logout();
      });
    };

    window.addEventListener('authError', handleAuthError as EventListener);
    
    return () => {
      window.removeEventListener('authError', handleAuthError as EventListener);
    };
  }, [refreshAuth, logout]);
};