// src/layouts/AdminLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export default function AdminLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and admin status
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate('/admin/login');
          return;
        }

        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        if (error || !profile?.is_admin) {
          navigate('/admin/login');
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          navigate('/admin/login');
        } else if (session?.user) {
          // Recheck admin status on sign in
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', session.user.id)
            .single();

          if (profile?.is_admin) {
            setUser(session.user);
          } else {
            await supabase.auth.signOut();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render layout if not authenticated
  if (!user) {
    return null;
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
            <div className="flex items-center gap-2 px-4 h-14">
              <h1 className="text-sm font-medium">Admin</h1>
            </div>
          </header>
          <main className="p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}