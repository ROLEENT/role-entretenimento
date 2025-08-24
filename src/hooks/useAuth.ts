import { useState, useEffect } from 'react';
import { authService, type AuthUser } from '@/services/authService';
import type { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
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
              console.log('Removing corrupted localStorage item:', key);
              localStorage.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.error('Error clearing corrupted data:', error);
      }
    };

    clearCorruptedData();

    // Simplified auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user as AuthUser || null);
        setIsAdmin(false);
        setLoading(false);
      }
    );

    // Simple initial session check
    authService.getCurrentUser()
      .then((authUser) => {
        if (!isMounted) return;
        setUser(authUser);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Auth initialization error:', error);
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    const result = await authService.signUp(email, password, displayName);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setLoading(false);
    return result;
  };

  const updateProfile = async (updates: {
    display_name?: string;
    avatar_url?: string;
    preferences_json?: any;
  }) => {
    const result = await authService.updateProfile(updates);
    
    if (!result.error) {
      // Refresh user data
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
    }
    
    return result;
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
    isAdmin
  };
};