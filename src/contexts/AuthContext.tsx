import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin status when user logs in
        if (session?.user) {
          setTimeout(async () => {
            await checkAdminStatus(session.user.email);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          await checkAdminStatus(session.user.email);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (email?: string) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }

    try {
      // Use maybeSingle() to handle 406 errors gracefully
      const q = supabase
        .from('admin_users')
        .select('id,is_active')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle(); // 406 -> null

      const { data, error } = await q;
      
      // Treat 406 (Not Acceptable) as "not admin" instead of error
      if (error && error.code === 'PGRST406') {
        console.log("Admin check: User not found or RLS restriction (406) - treating as non-admin");
        setIsAdmin(false);
        return;
      }
      
      // Handle other errors
      if (error) {
        console.warn("Admin check error:", error);
        setIsAdmin(false);
        return;
      }
      
      // If no data, user is not an active admin
      if (!data) {
        setIsAdmin(false);
        return;
      }

      // Double-check with approved_admins table (also handle 406 gracefully)
      const approvedQuery = supabase
        .from("approved_admins")
        .select("id")
        .eq("email", email)
        .eq("is_active", true)
        .maybeSingle();

      const { data: approvedData, error: approvedError } = await approvedQuery;
      
      // Treat 406 as "not approved" 
      if (approvedError && approvedError.code === 'PGRST406') {
        console.log("Approved admin check: User not found or RLS restriction (406) - treating as non-admin");
        setIsAdmin(false);
        return;
      }
      
      if (approvedError) {
        console.warn("Approved admin check error:", approvedError);
        setIsAdmin(false);
        return;
      }

      // User is admin only if found in both tables
      const isValidAdmin = !!data && !!approvedData;
      setIsAdmin(isValidAdmin);
      
      if (isValidAdmin) {
        console.log("Admin access granted for:", email);
      }
      
    } catch (error) {
      console.error("Unexpected error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = "Erro ao fazer login";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada";
        } else {
          errorMessage = error.message;
        }
        
        return { error: new Error(errorMessage) };
      }

      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: new Error("Erro interno do servidor") };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        let errorMessage = "Erro ao criar conta";
        
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email já está cadastrado";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        } else {
          errorMessage = error.message;
        }
        
        return { error: new Error(errorMessage) };
      }

      return { error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: new Error("Erro interno do servidor") };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Erro ao fazer logout");
        console.error("Sign out error:", error);
      } else {
        toast.success("Logout realizado com sucesso");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Erro ao fazer logout");
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}