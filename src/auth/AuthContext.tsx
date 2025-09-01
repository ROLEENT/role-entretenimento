import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = { 
  session: Session | null; 
  loading: boolean; 
  role: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasAdminAccess: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ error: any }>;
};

const defaultContext: AuthCtx = {
  session: null,
  loading: false,
  role: null,
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  hasAdminAccess: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null })
};

const Ctx = createContext<AuthCtx>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Lista de emails autorizados para admin (mesmo do AdminLogin.tsx)
  const AUTHORIZED_ADMIN_EMAILS = [
    'pablohenrique.dev@gmail.com',
    'admin@role.app',
    'fiih@roleentretenimento.com' // Adicionar o email do usuário
  ];
  
  const user = session?.user ?? null;
  const isAuthenticated = !!session?.user;
  
  // Admin baseado em email autorizado ao invés de user_metadata.role
  const isAdmin = !!(user?.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email));
  const role = isAdmin ? 'admin' : 'viewer';
  const hasAdminAccess = isAdmin;

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data }) => setSession(data.session)).finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: any) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user.id);
    return { error };
  };

  return (
    <Ctx.Provider 
      value={{ 
        session, 
        loading, 
        role, 
        user, 
        isAuthenticated, 
        isAdmin, 
        hasAdminAccess, 
        signIn, 
        signOut, 
        updateProfile 
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);