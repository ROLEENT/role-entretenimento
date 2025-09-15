import { Outlet } from "react-router-dom";
import { AdminV3Guard } from '@/components/AdminV3Guard';
import AdminProviders from './AdminProviders';
import { AdminSidebar } from './AdminSidebar';
import { AdminV3LayoutHeader } from './AdminV3LayoutHeader';
import { SidebarInset } from "@/components/ui/sidebar";
import { V5VersionChoiceModal } from './v5/V5VersionChoiceModal';
import { useV5Preferences } from '@/hooks/useV5Preferences';

export function AdminV3Layout() {
  const { shouldShowChoiceModal, markChoiceModalShown } = useV5Preferences();

  return (
    <AdminV3Guard>
      <AdminProviders>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <AdminV3LayoutHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
        
        {/* V5 Version Choice Modal */}
        <V5VersionChoiceModal 
          isOpen={shouldShowChoiceModal()} 
          onClose={markChoiceModalShown}
        />
      </AdminProviders>
    </AdminV3Guard>
  );
}