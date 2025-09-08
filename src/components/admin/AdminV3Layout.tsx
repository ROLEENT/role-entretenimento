import { Outlet } from "react-router-dom";
import { AdminV3Guard } from '@/components/AdminV3Guard';
import AdminProviders from './AdminProviders';
import { AdminSidebar } from './AdminSidebar';
import { AdminV3LayoutHeader } from './AdminV3LayoutHeader';
import { SidebarInset } from "@/components/ui/sidebar";

export function AdminV3Layout() {
  return (
    <AdminV3Guard>
      <AdminProviders>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <AdminV3LayoutHeader />
            <main className="flex-1 overflow-auto">
              <div className="p-4 md:p-6">
                <Outlet />
              </div>
            </main>
          </SidebarInset>
        </div>
      </AdminProviders>
    </AdminV3Guard>
  );
}