// src/layouts/AdminLayout.tsx
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLayout() {
  const { adminUser, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !adminUser) {
      navigate('/admin/login');
    }
  }, [loading, adminUser, navigate]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render layout if not authenticated
  if (!adminUser) {
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