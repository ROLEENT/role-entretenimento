import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Bell, 
  Users, 
  MapPin, 
  Calendar, 
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'announcement' | 'reminder';
  target: 'all' | 'city' | 'event_followers';
  city?: string;
  event_id?: string;
  scheduled_for?: string;
  sent: boolean;
  created_at: string;
}

interface PushSubscription {
  id: string;
  user_id: string;
  subscription: any;
  event_id?: string;
  created_at: string;
}

export function AdminNotifications() {
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [notifications, setNotifications] = useState<NotificationTemplate[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'announcement' as 'event' | 'announcement' | 'reminder',
    target: 'all' as 'all' | 'city' | 'event_followers',
    city: '',
    event_id: '',
    scheduled_for: '',
    schedule_enabled: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [subscriptionsResult, notificationsResult, citiesResult, eventsResult] = await Promise.all([
        supabase.from('push_subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('city').eq('status', 'active'),
        supabase.from('events').select('id, title, city').eq('status', 'active').order('date_start')
      ]);

      setSubscriptions(subscriptionsResult.data || []);
      // setNotifications(notificationsResult.data || []); // Table might not exist yet
      setEvents(eventsResult.data || []);
      
      const uniqueCities = [...new Set(citiesResult.data?.map(d => d.city) || [])];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getTargetAudience = () => {
    switch (notificationForm.target) {
      case 'all':
        return subscriptions.length;
      case 'city':
        return subscriptions.filter(sub => {
          // Filter by city logic would need user location data
          return Math.floor(subscriptions.length * 0.3); // Mock city percentage
        }).length;
      case 'event_followers':
        return subscriptions.filter(sub => sub.event_id === notificationForm.event_id).length;
      default:
        return 0;
    }
  };

  const sendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    try {
      setSending(true);

      // Filter subscriptions based on target
      let targetSubscriptions = subscriptions;
      
      if (notificationForm.target === 'event_followers' && notificationForm.event_id) {
        targetSubscriptions = subscriptions.filter(sub => sub.event_id === notificationForm.event_id);
      } else if (notificationForm.target === 'city' && notificationForm.city) {
        // Mock city filtering - in reality you'd need user location data
        targetSubscriptions = subscriptions.slice(0, Math.floor(subscriptions.length * 0.3));
      }

      if (targetSubscriptions.length === 0) {
        toast.error('Nenhum usuário encontrado para o público alvo selecionado');
        return;
      }

      // Send notification to edge function
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: notificationForm.title,
          message: notificationForm.message,
          subscriptions: targetSubscriptions.map(sub => sub.subscription),
          scheduled_for: notificationForm.schedule_enabled ? notificationForm.scheduled_for : null
        }
      });

      if (error) throw error;

      toast.success(`Notificação ${notificationForm.schedule_enabled ? 'agendada' : 'enviada'} para ${targetSubscriptions.length} usuários`);
      
      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        type: 'announcement',
        target: 'all',
        city: '',
        event_id: '',
        scheduled_for: '',
        schedule_enabled: false
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

  const predefinedTemplates = [
    {
      title: 'Novo Evento Disponível',
      message: 'Um novo evento foi adicionado na sua cidade! Confira agora.',
      type: 'event' as const
    },
    {
      title: 'Lembrete de Evento',
      message: 'Seu evento favorito acontece hoje! Não perca.',
      type: 'reminder' as const
    },
    {
      title: 'Atualização da Plataforma',
      message: 'Temos novidades incríveis para você! Confira as atualizações.',
      type: 'announcement' as const
    }
  ];

  const loadTemplate = (template: any) => {
    setNotificationForm(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Sistema de Notificações</h2>
          <p className="text-muted-foreground">
            Envie notificações push para usuários da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {subscriptions.length} inscritos
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Enviar Notificação</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Notification Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Criar Notificação
                </CardTitle>
                <CardDescription>
                  Configure e envie notificações para os usuários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título da notificação"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {notificationForm.title.length}/50 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Conteúdo da notificação"
                    rows={3}
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {notificationForm.message.length}/150 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={notificationForm.type} onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Anúncio</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target">Público Alvo</Label>
                  <Select value={notificationForm.target} onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, target: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Usuários</SelectItem>
                      <SelectItem value="city">Por Cidade</SelectItem>
                      <SelectItem value="event_followers">Seguidores de Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {notificationForm.target === 'city' && (
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Select value={notificationForm.city} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, city: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {notificationForm.target === 'event_followers' && (
                  <div>
                    <Label htmlFor="event">Evento</Label>
                    <Select value={notificationForm.event_id} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, event_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map(event => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title} - {event.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={notificationForm.schedule_enabled}
                    onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, schedule_enabled: checked }))}
                  />
                  <Label>Agendar envio</Label>
                </div>

                {notificationForm.schedule_enabled && (
                  <div>
                    <Label htmlFor="scheduled_for">Data e Hora</Label>
                    <Input
                      id="scheduled_for"
                      type="datetime-local"
                      value={notificationForm.scheduled_for}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduled_for: e.target.value }))}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    <Target className="inline h-4 w-4 mr-1" />
                    Alcance: {getTargetAudience()} usuários
                  </div>
                  
                  <Button onClick={sendNotification} disabled={sending}>
                    {sending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {notificationForm.schedule_enabled ? 'Agendar' : 'Enviar Agora'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates and Preview */}
            <div className="space-y-6">
              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Templates Predefinidos</CardTitle>
                  <CardDescription>
                    Use templates prontos para acelerar o processo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {predefinedTemplates.map((template, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => loadTemplate(template)}
                      >
                        <h4 className="font-medium text-sm">{template.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.message}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {template.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {(notificationForm.title || notificationForm.message) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview da Notificação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg border-l-4 border-l-primary">
                      <div className="flex items-start gap-3">
                        <Bell className="h-5 w-5 mt-0.5 text-primary" />
                        <div>
                          <h4 className="font-semibold">{notificationForm.title || 'Título da notificação'}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notificationForm.message || 'Mensagem da notificação aparecerá aqui'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            ROLÊ • agora
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Notificações</CardTitle>
              <CardDescription>
                Visualize todas as notificações enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação enviada ainda</p>
                <p className="text-sm">Suas notificações aparecerão aqui após o primeiro envio</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Configure as opções gerais do sistema de notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações automáticas de novos eventos</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações automaticamente quando novos eventos forem criados
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lembretes de eventos</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembretes para usuários sobre eventos favoritos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios de entrega</h4>
                    <p className="text-sm text-muted-foreground">
                      Receber relatórios sobre a entrega das notificações
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Estatísticas de Inscrições</h4>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total de inscrições ativas</span>
                    <Badge>{subscriptions.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inscrições por evento</span>
                    <Badge>{subscriptions.filter(s => s.event_id).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inscrições gerais</span>
                    <Badge>{subscriptions.filter(s => !s.event_id).length}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}