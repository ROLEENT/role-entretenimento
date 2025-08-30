import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsletterSubscription {
  id: string;
  email: string;
  name?: string;
  city?: string;
  status: string;
  confirmed_at?: string;
  unsubscribed_at?: string;
  created_at: string;
}

const statusOptions = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendente' },
  { value: 'unsubscribed', label: 'Descadastrado' },
];

const getStatusBadge = (status: string) => {
  const statusMap = {
    confirmed: { label: 'Confirmado', variant: 'default' as const },
    pending: { label: 'Pendente', variant: 'secondary' as const },
    unsubscribed: { label: 'Descadastrado', variant: 'destructive' as const },
  };
  
  const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const NewsletterPage = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      key: 'email' as keyof NewsletterSubscription,
      label: 'Email',
      sortable: true,
    },
    {
      key: 'name' as keyof NewsletterSubscription,
      label: 'Nome',
      render: (value: string) => value || '-',
    },
    {
      key: 'city' as keyof NewsletterSubscription,
      label: 'Cidade',
      render: (value: string) => value || '-',
    },
    {
      key: 'status' as keyof NewsletterSubscription,
      label: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'created_at' as keyof NewsletterSubscription,
      label: 'Data de Inscrição',
      sortable: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }),
    },
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      setFilteredSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching newsletter subscriptions:', error);
      toast.error('Erro ao carregar inscrições da newsletter');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredSubscriptions(subscriptions);
      return;
    }

    const filtered = subscriptions.filter(sub =>
      sub.email.toLowerCase().includes(query.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(query.toLowerCase())) ||
      (sub.city && sub.city.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredSubscriptions(filtered);
  };

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilteredSubscriptions(subscriptions);
      return;
    }

    const filtered = subscriptions.filter(sub => sub.status === status);
    setFilteredSubscriptions(filtered);
  };

  const handleSort = (key: keyof NewsletterSubscription, direction: 'asc' | 'desc') => {
    const sorted = [...filteredSubscriptions].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    setFilteredSubscriptions(sorted);
  };

  const handleBatchStatusChange = async (selectedItems: NewsletterSubscription[], newStatus: string) => {
    try {
      const ids = selectedItems.map(item => item.id);
      
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
        updateData.unsubscribed_at = null;
      } else if (newStatus === 'unsubscribed') {
        updateData.unsubscribed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update(updateData)
        .in('id', ids);

      if (error) throw error;

      toast.success(`Status atualizado para ${selectedItems.length} inscrição(s)`);
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleExportCsv = (selectedItems: NewsletterSubscription[]) => {
    const csvHeaders = ['Email', 'Nome', 'Cidade', 'Status', 'Data de Inscrição', 'Data de Confirmação', 'Data de Descadastro'];
    const csvData = selectedItems.map(sub => [
      sub.email,
      sub.name || '',
      sub.city || '',
      sub.status,
      format(new Date(sub.created_at), 'dd/MM/yyyy'),
      sub.confirmed_at ? format(new Date(sub.confirmed_at), 'dd/MM/yyyy') : '',
      sub.unsubscribed_at ? format(new Date(sub.unsubscribed_at), 'dd/MM/yyyy') : ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success('CSV exportado com sucesso');
  };

  const handleDelete = async (selectedItems: NewsletterSubscription[]) => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.length} inscrição(s)?`)) {
      return;
    }

    try {
      const ids = selectedItems.map(item => item.id);
      
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast.success(`${selectedItems.length} inscrição(s) excluída(s)`);
      await fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscriptions:', error);
      toast.error('Erro ao excluir inscrições');
    }
  };

  // Export only emails for email marketing
  const handleExportEmails = () => {
    const confirmedEmails = subscriptions
      .filter(sub => sub.status === 'confirmed')
      .map(sub => sub.email);

    const emailContent = confirmedEmails.join('\n');
    const blob = new Blob([emailContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-emails-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    link.click();

    toast.success(`${confirmedEmails.length} emails exportados`);
  };

  const confirmedCount = subscriptions.filter(sub => sub.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">Gerencie as inscrições da newsletter</p>
          <p className="text-sm text-muted-foreground mt-1">
            {confirmedCount} inscrição(s) confirmada(s) de {subscriptions.length} total
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportEmails}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            Exportar Emails Confirmados
          </button>
        </div>
      </div>

      <DataTable
        data={filteredSubscriptions}
        columns={columns}
        loading={loading}
        searchPlaceholder="Buscar por email, nome ou cidade..."
        statusOptions={statusOptions}
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
        onSort={handleSort}
        onExportCsv={handleExportCsv}
        onBatchStatusChange={handleBatchStatusChange}
        onDelete={handleDelete}
        getRowId={(item) => item.id}
        showActions={false}
      />
    </div>
  );
};