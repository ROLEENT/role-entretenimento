import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  portfolio_url?: string;
  role?: string;
  message?: string;
  lgpd_consent: boolean;
  status: string;
  notes?: string;
  created_at: string;
}

const statusOptions = [
  { value: 'new', label: 'Novo' },
  { value: 'reviewing', label: 'Em Análise' },
  { value: 'interviewed', label: 'Entrevistado' },
  { value: 'accepted', label: 'Aceito' },
  { value: 'rejected', label: 'Rejeitado' },
];

const getStatusBadge = (status: string) => {
  const statusMap = {
    new: { label: 'Novo', variant: 'default' as const },
    reviewing: { label: 'Em Análise', variant: 'secondary' as const },
    interviewed: { label: 'Entrevistado', variant: 'outline' as const },
    accepted: { label: 'Aceito', variant: 'default' as const },
    rejected: { label: 'Rejeitado', variant: 'destructive' as const },
  };
  
  const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const columns = [
    {
      key: 'full_name' as keyof Application,
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'email' as keyof Application,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role' as keyof Application,
      label: 'Área',
      render: (value: string) => value || '-',
    },
    {
      key: 'status' as keyof Application,
      label: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'created_at' as keyof Application,
      label: 'Data',
      sortable: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }),
    },
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      setFilteredApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Erro ao carregar candidaturas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredApplications(applications);
      return;
    }

    const filtered = applications.filter(app =>
      app.full_name.toLowerCase().includes(query.toLowerCase()) ||
      app.email.toLowerCase().includes(query.toLowerCase()) ||
      (app.role && app.role.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredApplications(filtered);
  };

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilteredApplications(applications);
      return;
    }

    const filtered = applications.filter(app => app.status === status);
    setFilteredApplications(filtered);
  };

  const handleSort = (key: keyof Application, direction: 'asc' | 'desc') => {
    const sorted = [...filteredApplications].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    setFilteredApplications(sorted);
  };

  const handleView = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || "");
  };

  const handleBatchStatusChange = async (selectedItems: Application[], newStatus: string) => {
    try {
      const ids = selectedItems.map(item => item.id);
      
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .in('id', ids);

      if (error) throw error;

      toast.success(`Status atualizado para ${selectedItems.length} candidatura(s)`);
      await fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleExportCsv = (selectedItems: Application[]) => {
    const csvHeaders = ['Nome', 'Email', 'Telefone', 'Área', 'Status', 'Data', 'Mensagem'];
    const csvData = selectedItems.map(app => [
      app.full_name,
      app.email,
      app.phone || '',
      app.role || '',
      app.status,
      format(new Date(app.created_at), 'dd/MM/yyyy'),
      app.message || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `candidaturas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success('CSV exportado com sucesso');
  };

  const handleExportCsvByDate = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Nenhuma candidatura encontrada no período selecionado');
        return;
      }

      const csvHeaders = ['Nome', 'Email', 'Telefone', 'Área', 'Status', 'Data', 'Mensagem'];
      const csvData = data.map(app => [
        app.full_name,
        app.email,
        app.phone || '',
        app.role || '',
        app.status,
        format(new Date(app.created_at), 'dd/MM/yyyy'),
        app.message || ''
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `candidaturas-${startDate}-${endDate}.csv`;
      link.click();

      toast.success(`${data.length} candidaturas exportadas com sucesso`);
    } catch (error) {
      console.error('Error exporting CSV by date:', error);
      toast.error('Erro ao exportar candidaturas por período');
    }
  };

  const handleDelete = async (selectedItems: Application[]) => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.length} candidatura(s)?`)) {
      return;
    }

    try {
      const ids = selectedItems.map(item => item.id);
      
      const { error } = await supabase
        .from('applications')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast.success(`${selectedItems.length} candidatura(s) excluída(s)`);
      await fetchApplications();
    } catch (error) {
      console.error('Error deleting applications:', error);
      toast.error('Erro ao excluir candidaturas');
    }
  };

  const saveNotes = async () => {
    if (!selectedApplication) return;

    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ notes })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      toast.success('Observações salvas');
      setSelectedApplication({ ...selectedApplication, notes });
      await fetchApplications();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Erro ao salvar observações');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidaturas</h1>
        <p className="text-muted-foreground">Gerencie as candidaturas recebidas via formulário</p>
      </div>

      <DataTable
        data={filteredApplications}
        columns={columns}
        loading={loading}
        searchPlaceholder="Buscar por nome, email ou área..."
        statusOptions={statusOptions}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onSort={handleSort}
        onView={handleView}
        onExportCsv={handleExportCsv}
        onExportCsvByDate={handleExportCsvByDate}
        onBatchStatusChange={handleBatchStatusChange}
        onDelete={handleDelete}
        getRowId={(item) => item.id}
      />

      <Sheet open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          {selectedApplication && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedApplication.full_name}</SheetTitle>
                <SheetDescription>
                  Candidatura recebida em {format(new Date(selectedApplication.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedApplication.email}</p>
                  </div>
                  {selectedApplication.phone && (
                    <div>
                      <Label className="text-sm font-medium">Telefone</Label>
                      <p className="text-sm text-muted-foreground">{selectedApplication.phone}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Área de Interesse</Label>
                    <p className="text-sm text-muted-foreground">{selectedApplication.role || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                </div>

                {selectedApplication.portfolio_url && (
                  <div>
                    <Label className="text-sm font-medium">Portfólio</Label>
                    <a 
                      href={selectedApplication.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {selectedApplication.portfolio_url}
                    </a>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Mensagem do Candidato</Label>
                  <p className="text-sm text-muted-foreground mt-1 bg-muted p-3 rounded-md">
                    {selectedApplication.message || 'Nenhuma mensagem fornecida'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">LGPD</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.lgpd_consent ? '✅ Consentimento dado' : '❌ Consentimento não dado'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Observações Internas</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações sobre esta candidatura..."
                    className="mt-1"
                    rows={4}
                  />
                  <Button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="mt-2"
                    size="sm"
                  >
                    {savingNotes ? 'Salvando...' : 'Salvar Observações'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};