import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { SessionStatusIndicator } from "@/components/admin/SessionStatusIndicator";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Helmet } from 'react-helmet';

export default function AdminLayout() {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>Admin V2 - Plataforma Role</title>
        <meta name="description" content="Painel administrativo simplificado da plataforma Role" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
              <div className="flex items-center justify-between gap-2 px-4 h-14">
                <h1 className="text-sm font-medium">Administração V2</h1>
                <SessionStatusIndicator />
              </div>
            </header>
            <main className="p-6">
              <AdminBreadcrumbs />
              <ErrorBoundary>
                <Outlet />
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