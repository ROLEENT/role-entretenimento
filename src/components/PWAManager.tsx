import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Bell, BellOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const PWAManager = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if app is installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      toast.success('App instalado com sucesso!');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      toast.error('Seu navegador não suporta service workers');
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        
        // Register service worker and subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        
        // Create push subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // You'll need to set this up
        });

        // Save subscription to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .insert({
              user_id: user.id,
              endpoint: subscription.endpoint,
              p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
              auth: arrayBufferToBase64(subscription.getKey('auth')!)
            });
        }

        toast.success('Notificações ativadas!');
      } else {
        toast.error('Permissão para notificações negada');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Erro ao ativar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }

      setNotificationsEnabled(false);
      toast.success('Notificações desativadas');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setLoading(false);
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <div className="space-y-4">
      {!isInstalled && deferredPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Instalar App
            </CardTitle>
            <CardDescription>
              Instale o ROLÊ no seu dispositivo para acesso rápido e experiência nativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstallApp} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Instalar ROLÊ
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Receba alertas sobre eventos salvos e artistas que você segue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notificationsEnabled ? (
            <Button
              onClick={handleDisableNotifications}
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              <BellOff className="h-4 w-4 mr-2" />
              Desativar Notificações
            </Button>
          ) : (
            <Button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações
            </Button>
          )}
        </CardContent>
      </Card>

      {isInstalled && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              ✅ App instalado com sucesso!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};