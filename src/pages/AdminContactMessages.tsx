import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { contactService } from '@/services/contactService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminContactMessages = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.profile?.is_admin) {
      fetchMessages();
    }
  }, [isAuthenticated, user]);

  const fetchMessages = async () => {
    try {
      const data = await contactService.getAllMessages();
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoadingMessages(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await contactService.updateMessageStatus(id, status);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === id ? { ...msg, status } : msg
        )
      );
      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.profile?.is_admin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Mensagens de Contato</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as mensagens recebidas através do formulário de contato
            </p>
          </div>

          {loadingMessages ? (
            <div className="text-center py-8">
              <p>Carregando mensagens...</p>
            </div>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma mensagem encontrada</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{message.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          De: {message.name} ({message.email})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusLabel(message.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Mensagem:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        {message.status !== 'in_progress' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus(message.id, 'in_progress')}
                          >
                            Marcar em Andamento
                          </Button>
                        )}
                        {message.status !== 'resolved' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus(message.id, 'resolved')}
                          >
                            Marcar como Resolvido
                          </Button>
                        )}
                        {message.status !== 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatus(message.id, 'pending')}
                          >
                            Marcar como Pendente
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminContactMessages;