import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, MessageSquare, User, Calendar, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminContactMessagesFull = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

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

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase.rpc('update_contact_message_status', {
        p_id: messageId,
        p_status: status
      });

      if (error) throw error;

      toast.success(`Mensagem marcada como ${status === 'resolved' ? 'resolvida' : 'pendente'}`);
      fetchMessages();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(message => {
    if (filter === 'pending') return message.status === 'pending';
    if (filter === 'resolved') return message.status === 'resolved';
    return true;
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

  const getStatusColor = (status: string) => {
    return status === 'resolved' ? 'bg-green-500/10 text-green-700' : 'bg-yellow-500/10 text-yellow-700';
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
            <Filter className="w-4 h-4" />
            <Select value={filter} onValueChange={(value: 'all' | 'pending' | 'resolved') => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="resolved">Resolvidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma mensagem encontrada</h3>
            <p className="text-muted-foreground text-center">
              {filter !== 'all' ? `Nenhuma mensagem ${filter === 'pending' ? 'pendente' : 'resolvida'} encontrada` : 'Ainda não há mensagens de contato'}
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
                      <Badge className={getStatusColor(message.status)}>
                        {message.status === 'resolved' ? 'Resolvida' : 'Pendente'}
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
                          <span>{message.email}</span>
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
                    {message.message}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {message.status === 'pending' ? (
                    <Button 
                      size="sm" 
                      onClick={() => updateMessageStatus(message.id, 'resolved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marcar como Resolvida
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateMessageStatus(message.id, 'pending')}
                    >
                      Marcar como Pendente
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`mailto:${message.email}?subject=Re: ${message.subject}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Responder por Email
                  </Button>
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