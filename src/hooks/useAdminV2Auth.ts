/**
 * @deprecated Use useSecureAuth instead
 * ETAPA 1: Hook de auth legado sendo substituído pelo useSecureAuth
 */
import { useSecureAuth } from './useSecureAuth';

export const useAdminV2Auth = () => {
  console.warn('useAdminV2Auth is deprecated. Use useSecureAuth instead.');
  
  const secureAuth = useSecureAuth();
  
  return {
    user: secureAuth.user,
    session: secureAuth.session,
    loading: secureAuth.loading,
    status: secureAuth.loading ? 'loading' : (secureAuth.isAuthenticated ? 'ready' : 'error'),
    isAuthenticated: secureAuth.isAuthenticated,
    logout: secureAuth.logout
  };
};