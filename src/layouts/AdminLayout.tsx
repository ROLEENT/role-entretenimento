import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminRouter from "@/routes/AdminRouter";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
            <div className="flex items-center gap-2 px-4 h-14">
              <h1 className="text-sm font-medium">Administração</h1>
            </div>
          </header>
          <main className="p-6">
            <AdminRouter />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}