import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Bell, Send, Settings, CheckCircle, XCircle, BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/useAdminSession";
import { toast } from "sonner";
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from "@/utils/vapidKeys";

interface PushSubscription {
  id: string;
  admin_email: string;
  endpoint: string;
  is_active: boolean;
  created_at: string;
}

function NotificationsPushPage() {
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: ''
  });
  const { adminEmail } = useAdminSession();

  const checkPushSupport = () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Service Workers não são suportados neste navegador');
      return false;
    }
    
    if (!('PushManager' in window)) {
      toast.error('Push notifications não são suportadas neste navegador');
      return false;
    }
    
    return true;
  };

  const requestNotificationPermission = async () => {
    if (!checkPushSupport()) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('Permissão para notificações negada');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Save subscription to database
      const { error } = await supabase
        .from('admin_push_subscriptions')
        .insert({
          admin_email: adminEmail,
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        });

      if (error) throw error;

      setPushEnabled(true);
      toast.success('Notificações push ativadas com sucesso!');
      fetchSubscriptions();
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      toast.error('Erro ao configurar notificações push');
    }
  };

  const fetchSubscriptions = async () => {
    if (!adminEmail) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_push_subscriptions')
        .select('*')
        .eq('admin_email', adminEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
      setPushEnabled(data?.some(s => s.is_active) || false);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  const sendPushNotification = async () => {
    if (!formData.title || !formData.body) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: formData.title,
          body: formData.body,
          url: formData.url || '/',
        }
      });

      if (error) throw error;

      toast.success('Notificação enviada com sucesso!');
      setFormData({ title: '', body: '', url: '' });
    } catch (error) {
      console.error('Error sending push notification:', error);
      toast.error('Erro ao enviar notificação');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [adminEmail]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notificações Push Admin</h1>
        <p className="text-muted-foreground">
          Configure e envie notificações push para administradores
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração
            </CardTitle>
            <CardDescription>
              Configure suas notificações push
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status das Notificações</p>
                <p className="text-sm text-muted-foreground">
                  {pushEnabled ? 'Ativadas' : 'Desativadas'}
                </p>
              </div>
              <Badge variant={pushEnabled ? 'default' : 'secondary'}>
                {pushEnabled ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {pushEnabled ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            {!pushEnabled && (
              <Button 
                onClick={requestNotificationPermission}
                className="w-full"
              >
                <BellRing className="h-4 w-4 mr-2" />
                Ativar Notificações Push
              </Button>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Assinaturas Ativas</h4>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {subscriptions.filter(s => s.is_active).length} dispositivo(s) conectado(s)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Notificação
            </CardTitle>
            <CardDescription>
              Envie uma notificação para todos os admins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título da notificação"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Conteúdo da notificação"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL (opcional)</label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/admin-v3/agenda"
              />
            </div>

            <Button 
              onClick={sendPushNotification}
              disabled={sending || !pushEnabled}
              className="w-full"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Notificação
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Dispositivos Registrados
          </CardTitle>
          <CardDescription>
            Lista de dispositivos que recebem notificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registrado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum dispositivo registrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.admin_email}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {sub.endpoint.slice(0, 50)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                        {sub.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationsPushPage;