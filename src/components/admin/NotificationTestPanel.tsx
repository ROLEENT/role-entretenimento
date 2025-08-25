import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Send, Clock, MessageCircle, Star, Users, Activity, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TestNotificationData {
  title: string;
  body: string;
  userIds?: string[];
  targetAll?: boolean;
  url?: string;
}

interface CronJobInfo {
  jobname: string;
  schedule: string;
  command: string;
  active: boolean;
}

export function NotificationTestPanel() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [cronJobs, setCronJobs] = useState<CronJobInfo[]>([]);
  const [testData, setTestData] = useState<TestNotificationData>({
    title: '',
    body: '',
    targetAll: false,
    url: ''
  });

  // Carregar informações dos cron jobs
  const loadCronJobs = async () => {
    try {
      const { data, error } = await supabase.rpc('list_notification_cron_jobs');
      if (error) throw error;
      setCronJobs(data || []);
    } catch (error) {
      console.error('Error loading cron jobs:', error);
      toast({
        title: "Erro ao carregar cron jobs",
        description: "Verifique os logs para mais detalhes",
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    loadCronJobs();
  }, []);

  // Função para testar notificação manual
  const sendTestNotification = async () => {
    if (!testData.title || !testData.body) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: testData.title,
          body: testData.body,
          targetAll: testData.targetAll,
          url: testData.url || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Notificação enviada!",
        description: `Enviada para ${data?.sent || 0} usuários`
      });

      // Limpar formulário
      setTestData({
        title: '',
        body: '',
        targetAll: false,
        url: ''
      });

    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Erro ao enviar notificação",
        description: "Verifique os logs para mais detalhes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para testar triggers específicos
  const testTrigger = async (triggerType: string) => {
    setIsLoading(true);
    try {
      let functionName = '';
      let testPayload = {};

      switch (triggerType) {
        case 'new-event':
          functionName = 'notify-new-event';
          testPayload = {
            event_id: 'test-event-id',
            title: 'Evento Teste - Show do Rock',
            city: 'São Paulo',
            date_start: new Date().toISOString(),
            venue: 'Venue Teste'
          };
          break;
        case 'event-reminder':
          functionName = 'notify-event-reminder';
          testPayload = { test: true };
          break;
        case 'comment-reply':
          functionName = 'notify-comment-reply';
          testPayload = {
            parent_comment_id: 'test-comment-id',
            replier_user_id: user?.id || 'test-user',
            content: 'Esta é uma resposta de teste!',
            entity_type: 'event',
            entity_id: 'test-event-id'
          };
          break;
        case 'weekly-highlights':
          functionName = 'notify-weekly-highlights';
          testPayload = { test: true };
          break;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testPayload
      });

      if (error) throw error;

      toast({
        title: `Trigger ${triggerType} testado!`,
        description: `Resultado: ${JSON.stringify(data, null, 2)}`
      });

    } catch (error) {
      console.error(`Error testing ${triggerType}:`, error);
      toast({
        title: `Erro no teste ${triggerType}`,
        description: "Verifique os logs para mais detalhes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScheduleDescription = (schedule: string) => {
    switch (schedule) {
      case '0 * * * *': return 'A cada hora';
      case '0 9 * * 1': return 'Segunda-feira às 9h';
      case '0 0 * * *': return 'Todo dia à meia-noite';
      default: return schedule;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Painel de Testes - Notificações Push
          </CardTitle>
          <CardDescription>
            Teste e monitore o sistema de notificações push em tempo real
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manual">Teste Manual</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="cron">Cron Jobs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        {/* Teste Manual */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Enviar Notificação Teste
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    placeholder="Ex: Novo evento em São Paulo!"
                    value={testData.title}
                    onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL (opcional)</label>
                  <Input
                    placeholder="Ex: /events/123"
                    value={testData.url}
                    onChange={(e) => setTestData(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  placeholder="Escreva a mensagem da notificação..."
                  value={testData.body}
                  onChange={(e) => setTestData(prev => ({ ...prev, body: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="targetAll"
                  checked={testData.targetAll}
                  onChange={(e) => setTestData(prev => ({ ...prev, targetAll: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="targetAll" className="text-sm">
                  Enviar para todos os usuários
                </label>
              </div>
              <Button 
                onClick={sendTestNotification} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Enviando..." : "Enviar Notificação Teste"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers */}
        <TabsContent value="triggers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Novo Evento
                </CardTitle>
                <CardDescription>
                  Testar notificação de novo evento criado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => testTrigger('new-event')} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Testar Trigger
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Lembrete de Evento
                </CardTitle>
                <CardDescription>
                  Testar lembretes de eventos próximos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => testTrigger('event-reminder')} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Testar Trigger
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Resposta de Comentário
                </CardTitle>
                <CardDescription>
                  Testar notificação de resposta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => testTrigger('comment-reply')} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Testar Trigger
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Destaques Semanais
                </CardTitle>
                <CardDescription>
                  Testar newsletter semanal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => testTrigger('weekly-highlights')} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  Testar Trigger
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cron Jobs */}
        <TabsContent value="cron" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Jobs Agendados
              </CardTitle>
              <CardDescription>
                Status dos trabalhos automáticos configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cronJobs.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum cron job configurado ou erro ao carregar
                    </AlertDescription>
                  </Alert>
                ) : (
                  cronJobs.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{job.jobname}</div>
                        <div className="text-sm text-muted-foreground">
                          {getScheduleDescription(job.schedule)}
                        </div>
                      </div>
                      <Badge variant={job.active ? "default" : "secondary"}>
                        {job.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <Button 
                onClick={loadCronJobs} 
                variant="outline" 
                className="w-full mt-4"
              >
                Atualizar Status
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoramento */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs e Monitoramento</CardTitle>
              <CardDescription>
                Links para monitorar o funcionamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Acesse os logs das Edge Functions para monitorar execuções e debugar problemas
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <a href="https://supabase.com/dashboard/project/nutlcbnruabjsxecqpnd/functions/send-push-notification/logs" target="_blank">
                    Logs Push Notifications
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://supabase.com/dashboard/project/nutlcbnruabjsxecqpnd/functions/notify-new-event/logs" target="_blank">
                    Logs Novos Eventos
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://supabase.com/dashboard/project/nutlcbnruabjsxecqpnd/functions/notify-event-reminder/logs" target="_blank">
                    Logs Lembretes
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://supabase.com/dashboard/project/nutlcbnruabjsxecqpnd/functions/notify-weekly-highlights/logs" target="_blank">
                    Logs Destaques Semanais
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}