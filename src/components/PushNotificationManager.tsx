import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationManagerProps {
  userId?: string;
  showSettings?: boolean;
}

const cities = [
  'São Paulo',
  'Rio de Janeiro', 
  'Belo Horizonte',
  'Brasília',
  'Salvador',
  'Fortaleza',
  'Recife',
  'Porto Alegre',
  'Curitiba',
  'Goiânia'
];

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ 
  userId, 
  showSettings = true 
}) => {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cityPreference, setCityPreference] = useState<string>('');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    checkSupport();
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (registration && userId) {
      checkSubscriptionStatus();
    }
  }, [registration, userId]);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 
                     'PushManager' in window && 
                     'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      console.log('Service Worker registered:', reg);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!registration || !userId) return;

    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Check if subscription exists in database
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', userId)
          .eq('is_active', true)
          .single();

        if (!error && data) {
          setIsSubscribed(true);
          setCityPreference(data.city_pref || '');
        } else {
          setIsSubscribed(false);
        }
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Seu navegador não suporta notificações push.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== 'granted') {
        toast({
          title: 'Permissão negada',
          description: 'É necessário permitir notificações para continuar.',
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    if (!registration || !userId) return;

    setLoading(true);
    try {
      const hasPermission = permission === 'granted' || await requestPermission();
      if (!hasPermission) return;

      // Get VAPID public key from environment
      const vapidPublicKey = 'BEl62iUYgUivyIFKdvPlrAcBjjjbAOpxaVYm_rOGqhFVKFLw0VLFLOPnJCyJGPmfSDjBz_7pRvNBq9bVnFzL5ug'; // You need to set this
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      // Convert keys to base64
      const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)));
      const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)));

      // Save subscription to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh,
          auth,
          city_pref: cityPreference || null,
          user_agent: navigator.userAgent,
          is_active: true
        }, {
          onConflict: 'endpoint'
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'Notificações ativadas!',
        description: 'Você receberá notificações sobre novos eventos.',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar as notificações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!registration || !userId) return;

    setLoading(true);
    try {
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Mark as inactive in database
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('endpoint', subscription.endpoint)
          .eq('user_id', userId);

        if (error) throw error;
      }

      setIsSubscribed(false);
      toast({
        title: 'Notificações desativadas',
        description: 'Você não receberá mais notificações push.',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar as notificações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCityPreference = async () => {
    if (!isSubscribed || !userId) return;

    try {
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) return;

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ city_pref: cityPreference || null })
        .eq('endpoint', subscription.endpoint)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Preferências atualizadas',
        description: 'Suas preferências de cidade foram salvas.',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as preferências.',
        variant: 'destructive'
      });
    }
  };

  if (!isSupported) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Seu navegador não suporta notificações push.
        </AlertDescription>
      </Alert>
    );
  }

  if (!userId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Faça login para gerenciar suas notificações.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Status das Notificações</h4>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? 'Ativas' : 'Inativas'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isSubscribed ? 'default' : 'outline'}>
              {isSubscribed ? (
                <>
                  <Bell className="h-3 w-3 mr-1" />
                  Ativo
                </>
              ) : (
                <>
                  <BellOff className="h-3 w-3 mr-1" />
                  Inativo
                </>
              )}
            </Badge>
          </div>
        </div>

        {permission === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notificações foram bloqueadas. Habilite nas configurações do navegador.
            </AlertDescription>
          </Alert>
        )}

        {showSettings && isSubscribed && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="city">Cidade de Interesse</Label>
              <div className="flex gap-2">
                <Select value={cityPreference} onValueChange={setCityPreference}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={updateCityPreference}
                  size="sm"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {isSubscribed ? (
            <Button 
              variant="outline" 
              onClick={unsubscribeFromNotifications}
              disabled={loading}
              className="flex-1"
            >
              <BellOff className="h-4 w-4 mr-2" />
              {loading ? 'Desativando...' : 'Desativar Notificações'}
            </Button>
          ) : (
            <Button 
              onClick={subscribeToNotifications}
              disabled={loading || permission === 'denied'}
              className="flex-1"
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? 'Ativando...' : 'Ativar Notificações'}
            </Button>
          )}
        </div>

        {permission === 'default' && !isSubscribed && (
          <p className="text-xs text-muted-foreground">
            Clique em "Ativar Notificações" para receber alertas sobre novos eventos em sua cidade.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationManager;