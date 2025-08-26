import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminRouter from "@/routes/AdminRouter";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export default function AdminLayout() {
  return (
    <ErrorBoundary>
      {/* AdminAuthGuard temporariamente desabilitado para bypass */}
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
              <div className="flex items-center gap-2 px-4 h-14">
                <h1 className="text-sm font-medium">Administração</h1>
                <div className="ml-auto">
                  <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                    Modo Desenvolvimento - Auth Desabilitada
                  </span>
                </div>
              </div>
            </header>
            <main className="p-6">
              <ErrorBoundary>
                <AdminRouter />
              </ErrorBoundary>
            </main>
          </SidebarInset>
        </div>
        <Toaster />
        <SonnerToaster />
      </SidebarProvider>
    </ErrorBoundary>
  );
}