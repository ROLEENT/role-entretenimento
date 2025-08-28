import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminV2Router from "@/routes/AdminV2Router";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdminV2AuthGuard } from "@/components/AdminV2AuthGuard";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

export default function AdminLayout() {
  return (
    <ErrorBoundary>
      <AdminV2AuthGuard>
        <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
              <div className="flex items-center gap-2 px-4 h-14">
                <h1 className="text-sm font-medium">Administração V2</h1>
              </div>
            </header>
            <main className="p-6">
              <ErrorBoundary>
                <AdminV2Router />
              </ErrorBoundary>
            </main>
          </SidebarInset>
        </div>
        <Toaster />
        <SonnerToaster />
        </SidebarProvider>
      </AdminV2AuthGuard>
    </ErrorBoundary>
  );
}