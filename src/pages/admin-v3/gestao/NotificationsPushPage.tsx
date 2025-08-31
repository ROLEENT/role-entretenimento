import React, { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Bell, BellOff, Users, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PushSubscription {
  id: string;
  admin_email: string;
  endpoint: string;
  is_active: boolean;
  created_at: string;
}

interface NotificationForm {
  title: string;
  body: string;
  url?: string;
  badge?: string;
  icon?: string;
}

export default function NotificationsPushPage() {
  const { adminEmail } = useAdminSession();
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: '',
    body: '',
    url: '',
    badge: '/favicon.ico',
    icon: '/favicon.ico'
  });

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Gestão', path: '/admin-v3/gestao' },
    { label: 'Notificações Push' },
  ];

  // Carregar assinantes
  const loadSubscriptions = async () => {
    if (!adminEmail) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_push_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Erro ao carregar assinantes:', error);
      toast.error('Erro ao carregar assinantes de push');
    } finally {
      setLoading(false);
    }
  };

  // Verificar permissões e registro SW
  const checkNotificationSetup = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        setSwRegistration(registration);
        
        // Verificar se já está inscrito
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Erro ao verificar service worker:', error);
      }
    }
  };

  // Solicitar permissão de notificação
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Permissão para notificações concedida!');
      } else {
        toast.error('Permissão para notificações negada');
      }
    }
  };

  // Inscrever-se para push notifications
  const subscribeToPush = async () => {
    if (!swRegistration || !adminEmail) return;
    
    try {
      setLoading(true);
      
      // Chave VAPID pública (você precisará gerar uma)
      const vapidPublicKey = 'BG7zXkGDQtKQFKjWL_HQ8LfP9nE4lYf2z3kF8vP_JzN7xQ2mW6sY9A3fL2kP1sH4tR8E9oQ5x6V7sA2vT9pF0nY';
      
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Salvar assinatura no banco
      const subscriptionData = subscription.toJSON();
      
      const { error } = await supabase
        .from('admin_push_subscriptions')
        .insert({
          admin_email: adminEmail,
          endpoint: subscriptionData.endpoint!,
          p256dh: subscriptionData.keys!.p256dh,
          auth: subscriptionData.keys!.auth
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Inscrito para notificações push!');
      loadSubscriptions();
    } catch (error) {
      console.error('Erro ao inscrever para push:', error);
      toast.error('Erro ao se inscrever para notificações');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar inscrição
  const unsubscribeFromPush = async () => {
    if (!swRegistration || !adminEmail) return;
    
    try {
      setLoading(true);
      
      const subscription = await swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remover do banco
        await supabase
          .from('admin_push_subscriptions')
          .delete()
          .eq('admin_email', adminEmail);
      }

      setIsSubscribed(false);
      toast.success('Inscrição cancelada');
      loadSubscriptions();
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      toast.error('Erro ao cancelar inscrição');
    } finally {
      setLoading(false);
    }
  };

  // Enviar notificação
  const sendNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          admin_email: adminEmail,
          notification: {
            title: notificationForm.title,
            body: notificationForm.body,
            url: notificationForm.url,
            badge: notificationForm.badge,
            icon: notificationForm.icon
          }
        }
      });

      if (error) throw error;

      toast.success('Notificação enviada com sucesso!');
      setNotificationForm({
        title: '',
        body: '',
        url: '',
        badge: '/favicon.ico',
        icon: '/favicon.ico'
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

  // Alternar status de assinante
  const toggleSubscriptionStatus = async (subscriptionId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_push_subscriptions')
        .update({ is_active: !isActive })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success(`Assinante ${!isActive ? 'ativado' : 'desativado'}`);
      loadSubscriptions();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do assinante');
    }
  };

  useEffect(() => {
    checkNotificationSetup();
    loadSubscriptions();
  }, [adminEmail]);

  const activeSubscriptions = subscriptions.filter(s => s.is_active);

  const actions = (
    <div className="flex gap-2">
      {notificationPermission !== 'granted' ? (
        <Button onClick={requestNotificationPermission}>
          <Bell className="h-4 w-4 mr-2" />
          Permitir Notificações
        </Button>
      ) : !isSubscribed ? (
        <Button onClick={subscribeToPush} disabled={loading}>
          <Bell className="h-4 w-4 mr-2" />
          {loading ? 'Conectando...' : 'Se Inscrever'}
        </Button>
      ) : (
        <Button variant="outline" onClick={unsubscribeFromPush} disabled={loading}>
          <BellOff className="h-4 w-4 mr-2" />
          Cancelar Inscrição
        </Button>
      )}
    </div>
  );

  return (
    <AdminPageWrapper
      title="Notificações Push"
      description="Gerencie e envie notificações push para administradores"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total de Assinantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Assinantes Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeSubscriptions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Status Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={isSubscribed ? "default" : "secondary"}>
                {isSubscribed ? 'Inscrito' : 'Não Inscrito'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Status */}
        {notificationPermission !== 'granted' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para receber notificações push, você precisa conceder permissão primeiro.
            </AlertDescription>
          </Alert>
        )}

        {notificationPermission === 'granted' && !isSubscribed && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Permissão concedida! Clique em "Se Inscrever" para começar a receber notificações.
            </AlertDescription>
          </Alert>
        )}

        {/* Formulário de Envio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input
                  placeholder="Título da notificação"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL de Destino</label>
                <Input
                  placeholder="https://exemplo.com"
                  value={notificationForm.url}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem *</label>
              <Textarea
                placeholder="Conteúdo da notificação"
                value={notificationForm.body}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, body: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ícone</label>
                <Input
                  placeholder="/favicon.ico"
                  value={notificationForm.icon}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, icon: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Badge</label>
                <Input
                  placeholder="/favicon.ico"
                  value={notificationForm.badge}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, badge: e.target.value }))}
                />
              </div>
            </div>

            <Button 
              onClick={sendNotification} 
              disabled={sending || !notificationForm.title || !notificationForm.body}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para {activeSubscriptions.length} Assinante(s)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Assinantes */}
        <Card>
          <CardHeader>
            <CardTitle>Assinantes ({subscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Carregando assinantes...</span>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum assinante encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Inscrição</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.admin_email}</TableCell>
                        <TableCell>
                          <Badge variant={sub.is_active ? "default" : "secondary"}>
                            {sub.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(sub.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={sub.is_active}
                            onCheckedChange={() => toggleSubscriptionStatus(sub.id, sub.is_active)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
}