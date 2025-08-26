import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, MessageSquare, User, Calendar, Filter, Search, Download, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactMessage {
  id: string;
  name: string;
  email_hash: string;
  subject: string;
  body: string;
  message: string;
  handled: boolean;
  handled_by: string | null;
  created_at: string;
}

const AdminContactMessagesFull = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'handled' | 'unhandled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Try admin function first
      const { data, error } = await supabase.rpc('get_contact_messages');

      if (error) {
        // Fallback to direct query if RPC fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        setMessages(fallbackData || []);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const markAsHandled = async (messageId: string) => {
    try {
      const { error } = await supabase.rpc('mark_contact_message_handled', {
        p_id: messageId
      });

      if (error) throw error;

      toast.success('Mensagem marcada como tratada');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao marcar como tratada:', error);
      toast.error('Erro ao marcar como tratada');
    }
  };

  const markAsUnhandled = async (messageId: string) => {
    try {
      const { error } = await supabase.rpc('mark_contact_message_unhandled', {
        p_id: messageId
      });

      if (error) throw error;

      toast.success('Mensagem marcada como não tratada');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const exportToCSV = () => {
    const csvData = filteredMessages.map(message => ({
      name: message.name,
      subject: message.subject,
      body: (message.body || message.message || '').replace(/\n/g, ' '),
      handled: message.handled ? 'Sim' : 'Não',
      created_at: formatDate(message.created_at)
    }));

    const csvContent = [
      ['Nome', 'Assunto', 'Mensagem', 'Tratada', 'Data'],
      ...csvData.map(row => [row.name, row.subject, row.body, row.handled, row.created_at])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mensagens_contato_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesFilter = filter === 'all' || 
      (filter === 'handled' && message.handled) || 
      (filter === 'unhandled' && !message.handled);
    
    const matchesSearch = searchTerm === '' || 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (handled: boolean) => {
    return handled ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mensagens de Contato</h1>
          <p className="text-muted-foreground">
            Visualize e responda mensagens enviadas pelos usuários
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={filter} onValueChange={(value: 'all' | 'handled' | 'unhandled') => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="handled">Tratadas</SelectItem>
                <SelectItem value="unhandled">Não Tratadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem encontrada</h3>
            <p className="text-muted-foreground text-center">
              {filter !== 'all' ? `Nenhuma mensagem ${filter === 'handled' ? 'tratada' : 'não tratada'} encontrada` : 'Ainda não há mensagens de contato'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredMessages.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      {message.subject}
                      <Badge className={getStatusColor(message.handled)}>
                        {message.handled ? 'Tratada' : 'Não Tratada'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{message.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-muted-foreground text-sm">Email protegido</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(message.created_at)}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Mensagem:</h4>
                  <p className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {message.body || message.message}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {!message.handled ? (
                    <Button 
                      size="sm" 
                      onClick={() => markAsHandled(message.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Tratada
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsUnhandled(message.id)}
                    >
                      Marcar como Não Tratada
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactMessagesFull;