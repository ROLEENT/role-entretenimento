import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, Settings, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PushNotificationsProps {
  eventId?: string;
}

const PushNotifications = ({ eventId }: PushNotificationsProps) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    checkNotificationPermission();
    checkSubscriptionStatus();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    // Service Worker temporarily disabled for debugging
    if (!user || (false && 'serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Não suportado",
        description: "Notificações não são suportadas neste navegador",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Notificações habilitadas",
          description: "Você receberá notificações sobre eventos importantes"
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar permissão para notificações",
        variant: "destructive"
      });
    }
  };

  const subscribeToNotifications = async () => {
    if (!user || !isAuthenticated) {
      toast({
        title: "Erro",
        description: "Faça login para receber notificações",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      
      // VAPID key for push notifications (should be generated and stored securely)
      const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI6YrrfuLNJ-vNWEKOH3H8xqM2Gz-8dA4K9E4GBXqsXI7s1iKp6Zx8oC0I';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription: subscription.toJSON(),
          event_id: eventId || null
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Notificações ativadas",
        description: "Você receberá notificações sobre este evento"
      });

    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      if (user) {
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId || null);

        if (error) throw error;
      }

      setIsSubscribed(false);
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais notificações sobre este evento"
      });

    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar as notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('ROLÊ - Notificação de Teste', {
        body: 'As notificações estão funcionando perfeitamente!',
        icon: '/favicon.png',
        badge: '/favicon.png'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Faça login para gerenciar suas notificações
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'denied' && (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              Notificações foram bloqueadas. Ative nas configurações do navegador.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'default' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ative as notificações para receber atualizações sobre eventos
            </p>
            <Button 
              onClick={requestNotificationPermission}
              className="w-full gap-2"
            >
              <Bell className="w-4 h-4" />
              Permitir Notificações
            </Button>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-3">
            {isSubscribed ? (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Notificações ativadas para este evento
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={unsubscribeFromNotifications}
                    disabled={loading}
                    className="flex-1 gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                    Desativar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={sendTestNotification}
                    className="flex-1 gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Testar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Receba notificações sobre atualizações e lembretes deste evento
                </p>
                <Button 
                  onClick={subscribeToNotifications}
                  disabled={loading}
                  className="w-full gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  Ativar Notificações
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotifications;