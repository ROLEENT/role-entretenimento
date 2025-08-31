import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AuthProfile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  birth_date?: string;
  phone?: string;
  role?: UserRole;
  preferences_json?: any;
  created_at: string;
  updated_at: string;
  following_count?: number;
  followers_count?: number;
  is_verified?: boolean;
  is_admin?: boolean;
  is_premium?: boolean;
}

export interface AuthUser extends User {
  profile?: AuthProfile;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  hasAdminAccess: boolean;
  adminEmail: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error?: any; user?: User }>;
  signIn: (email: string, password: string) => Promise<{ error?: any; user?: User }>;
  signOut: () => Promise<{ error?: any }>;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>('viewer');
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Load user profile
  const loadUserProfile = async (userId: string): Promise<AuthProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  };

  // Check if user is admin
  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('[AUTH] Admin check error:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('[AUTH] Admin check exception:', error);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(session);
          
          if (session?.user) {
            const userProfile = await loadUserProfile(session.user.id);
            const isAdminUser = session.user.email ? await checkAdminStatus(session.user.email) : false;
            
            const userRole: UserRole = isAdminUser 
              ? 'admin' 
              : userProfile?.role || 'viewer';

            const authUser: AuthUser = {
              ...session.user,
              profile: userProfile
            };

            setUser(authUser);
            setProfile(userProfile);
            setRole(userRole);
            setAdminEmail(isAdminUser ? session.user.email! : null);

            console.log(`[AUTH] User loaded: role=${userRole}, admin=${isAdminUser}`);
          } else {
            setUser(null);
            setProfile(null);
            setRole('viewer');
            setAdminEmail(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log(`[AUTH] State changed: ${event}`);
        setSession(session);
        
        if (session?.user && event !== 'INITIAL_SESSION') {
          setTimeout(async () => {
            try {
              const userProfile = await loadUserProfile(session.user.id);
              const isAdminUser = session.user.email ? await checkAdminStatus(session.user.email) : false;
              
              const userRole: UserRole = isAdminUser 
                ? 'admin' 
                : userProfile?.role || 'viewer';

              const authUser: AuthUser = {
                ...session.user,
                profile: userProfile
              };

              setUser(authUser);
              setProfile(userProfile);
              setRole(userRole);
              setAdminEmail(isAdminUser ? session.user.email! : null);

              console.log(`[AUTH] User updated: role=${userRole}, admin=${isAdminUser}`);
            } catch (error) {
              console.error('Error loading user data:', error);
            }
            setLoading(false);
          }, 0);
        } else if (!session) {
          setUser(null);
          setProfile(null);
          setRole('viewer');
          setAdminEmail(null);
          setLoading(false);
        }
      }
    );

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: displayName ? { display_name: displayName } : undefined
        }
      });

      if (error) throw error;

      // Create profile if user was created
      if (data.user && !error) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            display_name: displayName || email.split('@')[0],
            role: 'viewer'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { user: data.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setRole('viewer');
        setAdminEmail(null);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AuthProfile>) => {
    try {
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const updatedProfile = { ...profile, ...data };
      setProfile(updatedProfile);
      
      if (user) {
        setUser({
          ...user,
          profile: updatedProfile
        });
      }

      return { data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    role,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
    hasAdminAccess: role === 'admin' || role === 'editor',
    adminEmail,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Legacy compatibility - will be removed in next version
export const useAdminSession = () => {
  const { adminEmail, loading, isAdmin } = useAuth();
  return {
    adminEmail,
    isLoading: loading,
    isAdmin
  };
};