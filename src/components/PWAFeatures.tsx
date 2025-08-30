import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Download, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPermission {
  permission: 'default' | 'granted' | 'denied';
  supported: boolean;
}

const PWAFeatures = () => {
  const [notificationState, setNotificationState] = useState<NotificationPermission>({
    permission: 'default',
    supported: false
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check notification support
    if ('Notification' in window) {
      setNotificationState({
        permission: Notification.permission as 'default' | 'granted' | 'denied',
        supported: true
      });
    }

    // Check if app is installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallable(false);
      setDeferredPrompt(null);
      toast.success('ROLÊ instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if (!notificationState.supported) {
      toast.error('Notificações não são suportadas neste navegador');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast.success('Notificações ativadas! Você receberá atualizações sobre novos eventos.');
        
        // Subscribe to push notifications
        await subscribeToPushNotifications();
      } else if (permission === 'denied') {
        toast.error('Notificações foram negadas. Você pode ativar nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      toast.error('Erro ao ativar notificações');
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      // Service Worker temporarily disabled for debugging  
      if (false && 'serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          console.log('Já inscrito em push notifications');
          return;
        }

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI1stQnhUhm07TKnP_VGc8cE2Z_GJHW8rDv' // Example VAPID key
          )
        });

        console.log('Push notification subscription:', subscription);
        
        // Send subscription to server (would be implemented with Supabase Edge Function)
        // await sendSubscriptionToServer(subscription);
      }
    } catch (error) {
      console.error('Erro ao se inscrever em push notifications:', error);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) {
      toast.error('Instalação não disponível no momento');
      return;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast.success('Iniciando instalação do ROLÊ...');
      } else {
        toast.info('Instalação cancelada');
      }
      
      setDeferredPrompt(null);
      setInstallable(false);
    } catch (error) {
      console.error('Erro ao instalar app:', error);
      toast.error('Erro durante a instalação');
    }
  };

  const testNotification = () => {
    if (notificationState.permission === 'granted') {
      new Notification('ROLÊ - Teste de Notificação', {
        body: 'As notificações estão funcionando perfeitamente!',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: 'test-notification',
        requireInteraction: false
      });
      toast.success('Notificação de teste enviada!');
    } else {
      toast.error('Ative as notificações primeiro');
    }
  };

  // Helper function for VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (isInstalled && notificationState.permission === 'granted') {
    return null; // Don't show if already installed and notifications enabled
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Experiência Completa ROLÊ</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Instale o app e ative notificações para não perder nenhum evento incrível
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* PWA Install */}
          {installable && !isInstalled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Instalar App
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Instale o ROLÊ no seu dispositivo para acesso rápido e experiência nativa
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Acesso offline aos eventos favoritos</li>
                  <li>• Notificações push em tempo real</li>
                  <li>• Interface otimizada</li>
                  <li>• Sincronização automática</li>
                </ul>
                <Button onClick={installApp} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Instalar ROLÊ
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {notificationState.supported && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {notificationState.permission === 'granted' ? (
                    <Bell className="h-5 w-5" />
                  ) : (
                    <BellOff className="h-5 w-5" />
                  )}
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {notificationState.permission === 'granted'
                    ? 'Notificações ativadas! Você receberá atualizações sobre novos eventos.'
                    : 'Ative notificações para ser avisado sobre novos eventos na sua cidade'
                  }
                </p>
                
                {notificationState.permission === 'granted' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Notificações ativadas
                    </p>
                    <Button onClick={testNotification} variant="outline" size="sm">
                      Testar Notificação
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ul className="text-sm space-y-1">
                      <li>• Novos eventos na sua cidade</li>
                      <li>• Lembretes de eventos favoritos</li>
                      <li>• Destaques semanais</li>
                      <li>• Promoções e ingressos</li>
                    </ul>
                    <Button 
                      onClick={requestNotificationPermission} 
                      className="w-full gap-2"
                      disabled={notificationState.permission === 'denied'}
                    >
                      <Bell className="h-4 w-4" />
                      {notificationState.permission === 'denied' 
                        ? 'Notificações Bloqueadas' 
                        : 'Ativar Notificações'
                      }
                    </Button>
                    
                    {notificationState.permission === 'denied' && (
                      <p className="text-xs text-muted-foreground">
                        Para ativar, vá nas configurações do navegador
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Already Installed Message */}
          {isInstalled && (
            <Card className="md:col-span-2">
              <CardContent className="p-8 text-center">
                <Smartphone className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">App Instalado com Sucesso!</h3>
                <p className="text-muted-foreground">
                  O ROLÊ está instalado no seu dispositivo. Aproveite a experiência completa!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default PWAFeatures;