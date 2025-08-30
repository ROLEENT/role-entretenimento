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

interface ContactMessage {
  id: string;
  name: string;
  subject: string;
  message: string;
  status: string;
  handled: boolean;
  handled_by?: string;
  created_at: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em Andamento' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

const getStatusBadge = (status: string) => {
  const statusMap = {
    pending: { label: 'Pendente', variant: 'destructive' as const },
    in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
    resolved: { label: 'Resolvido', variant: 'default' as const },
    closed: { label: 'Fechado', variant: 'outline' as const },
  };
  
  const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const ContactPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const columns = [
    {
      key: 'name' as keyof ContactMessage,
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'subject' as keyof ContactMessage,
      label: 'Assunto',
      sortable: true,
      render: (value: string) => value || 'Sem assunto',
    },
    {
      key: 'status' as keyof ContactMessage,
      label: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'handled' as keyof ContactMessage,
      label: 'Tratado',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Sim' : 'Não'}
        </Badge>
      ),
    },
    {
      key: 'created_at' as keyof ContactMessage,
      label: 'Data',
      sortable: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR }),
    },
  ];

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
      setFilteredMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('Erro ao carregar mensagens de contato');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(msg =>
      msg.name.toLowerCase().includes(query.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(query.toLowerCase()) ||
      msg.message.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(msg => msg.status === status);
    setFilteredMessages(filtered);
  };

  const handleSort = (key: keyof ContactMessage, direction: 'asc' | 'desc') => {
    const sorted = [...filteredMessages].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (direction === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
    setFilteredMessages(sorted);
  };

  const handleView = (message: ContactMessage) => {
    setSelectedMessage(message);
    
    // Mark as handled when opened
    if (!message.handled) {
      markAsHandled(message.id);
    }
  };

  const markAsHandled = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ handled: true })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, handled: true } : msg
      ));
      setFilteredMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, handled: true } : msg
      ));
    } catch (error) {
      console.error('Error marking as handled:', error);
    }
  };

  const handleBatchStatusChange = async (selectedItems: ContactMessage[], newStatus: string) => {
    try {
      const ids = selectedItems.map(item => item.id);
      
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .in('id', ids);

      if (error) throw error;

      toast.success(`Status atualizado para ${selectedItems.length} mensagem(s)`);
      await fetchMessages();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleExportCsv = (selectedItems: ContactMessage[]) => {
    const csvHeaders = ['Nome', 'Assunto', 'Mensagem', 'Status', 'Tratado', 'Data'];
    const csvData = selectedItems.map(msg => [
      msg.name,
      msg.subject || 'Sem assunto',
      msg.message,
      msg.status,
      msg.handled ? 'Sim' : 'Não',
      format(new Date(msg.created_at), 'dd/MM/yyyy')
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contato-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success('CSV exportado com sucesso');
  };

  const handleExportCsvByDate = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('Nenhuma mensagem encontrada no período selecionado');
        return;
      }

      const csvHeaders = ['Nome', 'Assunto', 'Mensagem', 'Status', 'Tratado', 'Data'];
      const csvData = data.map(msg => [
        msg.name,
        msg.subject || 'Sem assunto',
        msg.message,
        msg.status,
        msg.handled ? 'Sim' : 'Não',
        format(new Date(msg.created_at), 'dd/MM/yyyy')
      ]);

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `contato-${startDate}-${endDate}.csv`;
      link.click();

      toast.success(`${data.length} mensagens exportadas com sucesso`);
    } catch (error) {
      console.error('Error exporting CSV by date:', error);
      toast.error('Erro ao exportar mensagens por período');
    }
  };

  const handleDelete = async (selectedItems: ContactMessage[]) => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedItems.length} mensagem(s)?`)) {
      return;
    }

    try {
      const ids = selectedItems.map(item => item.id);
      
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .in('id', ids);

      if (error) throw error;

      toast.success(`${selectedItems.length} mensagem(s) excluída(s)`);
      await fetchMessages();
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Erro ao excluir mensagens');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mensagens de Contato</h1>
        <p className="text-muted-foreground">Gerencie as mensagens recebidas via formulário de contato</p>
      </div>

      <DataTable
        data={filteredMessages}
        columns={columns}
        loading={loading}
        searchPlaceholder="Buscar por nome, assunto ou mensagem..."
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

      <Sheet open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          {selectedMessage && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedMessage.name}</SheetTitle>
                <SheetDescription>
                  Mensagem recebida em {format(new Date(selectedMessage.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tratado</Label>
                    <Badge variant={selectedMessage.handled ? 'default' : 'secondary'} className="mt-1">
                      {selectedMessage.handled ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Assunto</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedMessage.subject || 'Sem assunto'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Mensagem</Label>
                  <div className="text-sm text-muted-foreground mt-1 bg-muted p-4 rounded-md max-h-60 overflow-y-auto">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const emailBody = `Olá ${selectedMessage.name},\n\nObrigado por entrar em contato conosco.\n\nEm resposta à sua mensagem sobre "${selectedMessage.subject || 'seu contato'}":\n\n[SUA RESPOSTA AQUI]\n\nAtenciosamente,\nEquipe ROLÊ ENTRETENIMENTO`;
                      const mailtoLink = `mailto:${selectedMessage.name}?subject=Re: ${selectedMessage.subject || 'Contato'}&body=${encodeURIComponent(emailBody)}`;
                      window.open(mailtoLink);
                    }}
                  >
                    Responder por Email
                  </Button>
                  
                  {!selectedMessage.handled && (
                    <Button
                      onClick={() => markAsHandled(selectedMessage.id)}
                    >
                      Marcar como Tratado
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};