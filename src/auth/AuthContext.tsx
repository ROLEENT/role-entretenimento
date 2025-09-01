import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabase = createClient(url || "", anon || "", { auth: { persistSession: true } });

type AuthCtx = { session: Session | null; loading: boolean; role: string | null; };
const Ctx = createContext<AuthCtx>({ session: null, loading: false, role: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const role = (session?.user?.user_metadata as any)?.role ?? null;

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data }) => setSession(data.session)).finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return <Ctx.Provider value={{ session, loading, role }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);