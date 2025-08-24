import { useState, useEffect } from 'react';
import { authService, type AuthUser } from '@/services/authService';
import type { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
        
        if (session?.user) {
          setUser(session.user as AuthUser);
          // Defer profile and admin check to avoid deadlock
          setTimeout(() => {
            authService.getCurrentUser().then((authUser) => {
              if (authUser) {
                setUser(authUser);
                authService.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
              }
            }).catch(() => {
              console.error('Error fetching user profile');
            });
          }, 100);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    authService.getCurrentUser().then((authUser) => {
      setUser(authUser);
      if (authUser) {
        authService.isAdmin().then(setIsAdmin).catch(() => setIsAdmin(false));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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