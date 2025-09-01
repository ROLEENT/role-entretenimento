import { Outlet } from "react-router-dom";
import { AdminV3Guard } from '@/components/AdminV3Guard';
import AdminProviders from './AdminProviders';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export function AdminV3Layout() {
  return (
    <AdminV3Guard>
      <AdminProviders>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <h1 className="text-lg font-semibold text-foreground">Admin v3</h1>
              </div>
              <AdminHeader />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </AdminProviders>
    </AdminV3Guard>
  );
}