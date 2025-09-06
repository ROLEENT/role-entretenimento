import { AdminV3Guard } from '@/components/AdminV3Guard';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        
        <div className="pt-16">
          {children}
        </div>
      </div>
    </AdminV3Guard>
  );
}