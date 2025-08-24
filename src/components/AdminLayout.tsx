import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, loading } = useAdminAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only redirect if not loading and not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-4">
            {children || <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}