import { SecurityDashboard } from '@/components/admin/SecurityDashboard';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Segurança e Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Monitore a segurança do sistema e gerencie configurações de compliance
        </p>
      </div>
      
      <SecurityDashboard />
    </div>
  );
}