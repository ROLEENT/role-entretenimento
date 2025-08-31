import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';

function DashboardContent() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Painel administrativo
        </p>
      </div>
      
      {/* Ready for new components */}
      <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
        <p className="text-muted-foreground">Dashboard em construção</p>
      </div>
    </div>
  );
}

export default function AdminV3Dashboard() {
  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <DashboardContent />
          </div>
        </div>
      </div>
    </AdminV3Guard>
  );
}