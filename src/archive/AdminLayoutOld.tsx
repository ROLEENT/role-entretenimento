import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar as AdminSidebarOld } from "./AdminSidebarOld";
import AdminRouterOld from "./AdminRouterOld";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export default function AdminLayoutOld() {
  return (
    <ErrorBoundary>
      {/* AdminAuthGuard temporariamente desabilitado para bypass */}
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebarOld />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
              <div className="flex items-center gap-2 px-4 h-14">
                <h1 className="text-sm font-medium">Administração (Versão Antiga)</h1>
                <div className="ml-auto">
                  <span className="text-xs bg-orange-500/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                    Sistema Antigo - Migre para /admin-v2
                  </span>
                </div>
              </div>
            </header>
            <main className="p-6">
              <ErrorBoundary>
                <AdminRouterOld />
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