// src/layouts/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";

export default function AdminLayout() {
  return (
    <AdminProtectedRoute>
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
    </AdminProtectedRoute>
  );
}