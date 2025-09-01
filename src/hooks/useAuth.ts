import { useState, useEffect } from 'react';
import { authService, type AuthUser } from '@/services/authService';
import type { Session } from '@supabase/supabase-js';

// Global state to prevent multiple auth listeners
let globalAuthState = {
  user: null as AuthUser | null,
  session: null as Session | null,
  loading: true,
  role: null as 'admin' | 'editor' | 'viewer' | null,
  listeners: new Set<Function>(),
  initialized: false,
  subscription: null as any
};

// Debounce function to prevent spam
let lastUpdateTime = 0;
const UPDATE_DEBOUNCE = 100;

function updateGlobalState(updates: Partial<typeof globalAuthState>) {
  const now = Date.now();
  if (now - lastUpdateTime < UPDATE_DEBOUNCE) return;
  lastUpdateTime = now;
  
  Object.assign(globalAuthState, updates);
  globalAuthState.listeners.forEach(listener => listener(globalAuthState));
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(globalAuthState.user);
  const [session, setSession] = useState<Session | null>(globalAuthState.session);
  const [loading, setLoading] = useState(globalAuthState.loading);
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer' | null>(globalAuthState.role);

  useEffect(() => {
    let isMounted = true;
    
    // Add this component to global listeners
    const updateLocalState = (state: typeof globalAuthState) => {
      if (!isMounted) return;
      setUser(state.user);
      setSession(state.session);
      setLoading(state.loading);
      setRole(state.role);
    };
    
    globalAuthState.listeners.add(updateLocalState);
    
    // Initialize global auth state only once
    if (!globalAuthState.initialized) {
      globalAuthState.initialized = true;
      
      // Clear potentially corrupted auth data
      const clearCorruptedData = () => {
        try {
          const keys = ['sb-nutlcbnruabjsxecqpnd-auth-token', 'admin_session'];
          keys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
              try {
                JSON.parse(item);
              } catch {
                console.log('[AUTH] Removing corrupted localStorage item:', key);
                localStorage.removeItem(key);
              }
            }
          });
        } catch (error) {
          console.error('[AUTH] Error clearing corrupted data:', error);
        }
      };

      clearCorruptedData();

      // Get initial session synchronously
      const getInitialSession = async () => {
        try {
          const { data: { session } } = await authService.getSession();
          
          if (session?.user) {
            const currentUser = await authService.getCurrentUser();
            const userRole = currentUser?.profile?.role || 'viewer';
            
            const hasAccess = userRole === 'admin' || userRole === 'editor';
            const state = hasAccess ? 'allowed' : 'denied';
            const reason = hasAccess ? 'valid_role' : 'insufficient_permissions';
            
            console.log(`[AUTH] Initial session loaded - role:${userRole} state:${state}`);
            
            updateGlobalState({
              user: currentUser,
              session,
              role: userRole,
              loading: false
            });
          } else {
            console.log('[AUTH] No initial session found');
            updateGlobalState({
              user: null,
              session: null,
              role: null,
              loading: false
            });
          }
        } catch (error) {
          console.error('[AUTH] Error getting initial session:', error);
          updateGlobalState({ loading: false });
        }
      };

      // Create single auth state listener
      if (!globalAuthState.subscription) {
        const { data: { subscription } } = authService.onAuthStateChange(
          async (event, session) => {
            // Skip INITIAL_SESSION events to prevent loops
            if (event === 'INITIAL_SESSION') return;
            
            console.log('[AUTH] State changed:', event, !!session);
            
            if (session?.user) {
              try {
                const currentUser = await authService.getCurrentUser();
                const userRole = currentUser?.profile?.role || 'viewer';
                
                const hasAccess = userRole === 'admin' || userRole === 'editor';
                const state = hasAccess ? 'allowed' : 'denied';
                const reason = hasAccess ? 'valid_role' : 'insufficient_permissions';
                
                console.log(`[AUTH] User authenticated - role:${userRole} state:${state}`);
                
                updateGlobalState({
                  user: currentUser,
                  session,
                  role: userRole,
                  loading: false
                });
              } catch (error) {
                console.error('[AUTH] Error loading profile:', error);
                updateGlobalState({ loading: false });
              }
            } else {
              console.log('[AUTH] User signed out');
              updateGlobalState({
                user: null,
                session: null,
                role: null,
                loading: false
              });
            }
          }
        );
        
        globalAuthState.subscription = subscription;
      }

      getInitialSession();
    } else {
      // If already initialized, just sync local state
      updateLocalState(globalAuthState);
    }

    return () => {
      isMounted = false;
      globalAuthState.listeners.delete(updateLocalState);
      
      // Cleanup subscription only when no more listeners
      if (globalAuthState.listeners.size === 0 && globalAuthState.subscription) {
        globalAuthState.subscription.unsubscribe();
        globalAuthState.subscription = null;
        globalAuthState.initialized = false;
      }
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    updateGlobalState({ loading: true });
    const result = await authService.signUp(email, password, displayName);
    updateGlobalState({ loading: false });
    return result;
  };

  const signIn = async (email: string, password: string) => {
    updateGlobalState({ loading: true });
    const result = await authService.signIn(email, password);
    updateGlobalState({ loading: false });
    return result;
  };

  const signOut = async () => {
    updateGlobalState({ loading: true });
    const result = await authService.signOut();
    updateGlobalState({
      user: null,
      session: null,
      role: null,
      loading: false
    });
    return result;
  };

  const updateProfile = async (updates: {
    display_name?: string;
    avatar_url?: string;
    preferences_json?: any;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    birth_date?: string;
    phone?: string;
  }) => {
    try {
      // Verificar se o usuário está autenticado
      if (!session?.user) {
        throw new Error('Usuário não está autenticado');
      }

      console.log('Hook updateProfile - Usuário autenticado:', session.user.id);
      
      const result = await authService.updateProfile(updates);
      
      if (!result.error) {
        // Refresh user data após sucesso
        const updatedUser = await authService.getCurrentUser();
        updateGlobalState({ user: updatedUser });
        console.log('Perfil atualizado com sucesso');
      } else {
        console.error('Erro ao atualizar perfil:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Erro no hook updateProfile:', error);
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    role,
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
    hasAdminAccess: role === 'admin' || role === 'editor'
  };
};