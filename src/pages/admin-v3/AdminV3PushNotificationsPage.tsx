import React, { useState } from 'react';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  Send, 
  Settings, 
  Users, 
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: string;
}

const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'new-event',
    name: 'Novo Evento',
    title: 'Novo evento cadastrado',
    body: 'Um novo evento foi adicionado à plataforma',
    category: 'event'
  },
  {
    id: 'event-updated',
    name: 'Evento Atualizado',
    title: 'Evento atualizado',
    body: 'Um evento foi modificado recentemente',
    category: 'event'
  },
  {
    id: 'system-maintenance',
    name: 'Manutenção do Sistema',
    title: 'Manutenção programada',
    body: 'O sistema entrará em manutenção em breve',
    category: 'system'
  },
  {
    id: 'urgent-alert',
    name: 'Alerta Urgente',
    title: 'Atenção necessária',
    body: 'Uma ação urgente é necessária na plataforma',
    category: 'urgent'
  }
];

export default function AdminV3PushNotificationsPage() {
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    url: '',
    targetType: 'all',
    targetEmails: '',
    requireInteraction: false,
    silent: false
  });

  const { 
    supported, 
    permission, 
    subscription, 
    requestPermission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  // Get admin subscriptions
  const { data: subscriptions, isLoading: loadingSubscriptions, refetch: refetchSubscriptions } = useQuery({
    queryKey: ['admin-push-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_push_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (template: NotificationTemplate) => {
    setNotificationForm(prev => ({
      ...prev,
      title: template.title,
      body: template.body
    }));
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          notification: {
            title: notificationForm.title,
            body: notificationForm.body,
            url: notificationForm.url || '/',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png'
          },
          target_emails: notificationForm.targetType === 'specific' 
            ? notificationForm.targetEmails.split(',').map(email => email.trim()).filter(Boolean)
            : undefined,
          admin_email: 'admin@example.com' // TODO: Get from auth context
        }
      });

      if (error) throw error;

      toast({
        title: "Notificação enviada",
        description: `Enviada para ${data.sent_count} administrador(es)`,
      });

      // Reset form
      setNotificationForm({
        title: '',
        body: '',
        url: '',
        targetType: 'all',
        targetEmails: '',
        requireInteraction: false,
        silent: false
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erro ao enviar notificação",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  };

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      refetchSubscriptions();
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      refetchSubscriptions();
    }
  };

  const breadcrumbs = [
    { label: 'Admin v3', path: '/admin-v3' },
    { label: 'Notificações Push' }
  ];

  return (
    <AdminPageWrapper
      title="Notificações Push"
      description="Gerencie notificações push para administradores da plataforma"
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gerenciar
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Send Notification Form */}
            <div className="lg:col-span-2">
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
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        placeholder="Título da notificação"
                        value={notificationForm.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL (opcional)</Label>
                      <Input
                        id="url"
                        placeholder="/admin-v3/eventos"
                        value={notificationForm.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">Mensagem</Label>
                    <Textarea
                      id="body"
                      placeholder="Conteúdo da notificação"
                      value={notificationForm.body}
                      onChange={(e) => handleInputChange('body', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetType">Destinatários</Label>
                    <Select
                      value={notificationForm.targetType}
                      onValueChange={(value) => handleInputChange('targetType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os admins</SelectItem>
                        <SelectItem value="specific">Emails específicos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {notificationForm.targetType === 'specific' && (
                    <div className="space-y-2">
                      <Label htmlFor="targetEmails">Emails dos destinatários</Label>
                      <Input
                        id="targetEmails"
                        placeholder="admin1@example.com, admin2@example.com"
                        value={notificationForm.targetEmails}
                        onChange={(e) => handleInputChange('targetEmails', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireInteraction"
                        checked={notificationForm.requireInteraction}
                        onCheckedChange={(checked) => handleInputChange('requireInteraction', checked)}
                      />
                      <Label htmlFor="requireInteraction">Requer interação</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="silent"
                        checked={notificationForm.silent}
                        onCheckedChange={(checked) => handleInputChange('silent', checked)}
                      />
                      <Label htmlFor="silent">Silenciosa</Label>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendNotification} 
                    className="w-full"
                    disabled={!notificationForm.title || !notificationForm.body}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Notificação
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Templates */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {notificationTemplates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div>
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.body}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Status da Subscrição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={supported ? "default" : "destructive"}>
                    {supported ? "Suportado" : "Não Suportado"}
                  </Badge>
                  <Badge variant={permission === 'granted' ? "default" : "destructive"}>
                    {permission === 'granted' ? "Autorizado" : "Não Autorizado"}
                  </Badge>
                  <Badge variant={subscription ? "default" : "secondary"}>
                    {subscription ? "Inscrito" : "Não Inscrito"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  {!supported && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      Seu navegador não suporta notificações push
                    </div>
                  )}

                  {supported && permission !== 'granted' && (
                    <Button onClick={requestPermission} variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Solicitar Permissão
                    </Button>
                  )}

                  {supported && permission === 'granted' && !subscription && (
                    <Button onClick={handleSubscribe}>
                      <Bell className="h-4 w-4 mr-2" />
                      Ativar Notificações
                    </Button>
                  )}

                  {subscription && (
                    <Button onClick={handleUnsubscribe} variant="destructive">
                      <Bell className="h-4 w-4 mr-2" />
                      Desativar Notificações
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assinantes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSubscriptions ? (
                  <div className="text-sm text-muted-foreground">Carregando...</div>
                ) : subscriptions && subscriptions.length > 0 ? (
                  <div className="space-y-2">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium text-sm">{sub.admin_email}</div>
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Badge variant="default">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Nenhum assinante ativo
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Service Worker</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  O Service Worker é necessário para receber notificações push.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant={supported ? "default" : "destructive"}>
                    {supported ? "Ativo" : "Inativo"}
                  </Badge>
                  {supported && (
                    <span className="text-sm text-muted-foreground">
                      Registrado e funcionando
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">VAPID Keys</h3>
                <p className="text-sm text-muted-foreground">
                  As chaves VAPID são necessárias para autenticar o envio de notificações.
                  Configure as variáveis de ambiente VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY.
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Funcionalidades</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Notificações administrativas
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Templates pré-definidos
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Gerenciamento de assinantes
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Auditoria de envios
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
}