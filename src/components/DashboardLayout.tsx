import { AdminGuard } from '@/components/layouts/AdminGuard';
import { AdminV3Header } from '@/components/AdminV3Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16">
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}