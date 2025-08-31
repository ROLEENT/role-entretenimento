import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [supported, setSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Verificar suporte a push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true);
      checkPermission();
      getCurrentSubscription();
    }
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const getCurrentSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const currentSubscription = await registration.pushManager.getSubscription();
        setSubscription(currentSubscription);
      }
    } catch (error) {
      console.error('Erro ao obter subscrição atual:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        toast({
          title: "Permissão concedida",
          description: "Você receberá notificações sobre eventos importantes"
        });
        return true;
      } else {
        toast({
          title: "Permissão negada",
          description: "Você não receberá notificações push",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  };

  const subscribe = async (eventId?: string): Promise<boolean> => {
    if (!user || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      // Service Worker temporarily disabled for debugging
      if (false) {
        // Registrar service worker se necessário
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Criar subscrição
        const vapidPublicKey = 'BP8rBl7ExPJjIyVXE4v8YNY5aYKr3HQVcF8vR-RjF_-XOGwNEJ_iq4nLQHmFyL-5bVzjgM_zGwCmD1pQHfGhGms'; // VAPID key
        
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        // Salvar no Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            subscription: pushSubscription.toJSON(),
            event_id: eventId || null
          });

        if (error) throw error;

        setSubscription(pushSubscription);
        
        toast({
          title: "Notificações ativadas",
          description: eventId ? "Você receberá lembretes deste evento" : "Você receberá notificações importantes"
        });

        return true;
      }
      
      // Service Worker disabled - show message
      toast({
        title: "Notificações indisponíveis",
        description: "Service Worker está temporariamente desabilitado",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error('Erro ao criar subscrição:', error);
      toast({
        title: "Erro ao ativar notificações",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
      return false;
    }
  };

  const unsubscribe = async (eventId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      let query = supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { error } = await query;

      if (error) throw error;

      if (!eventId && subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
      }

      toast({
        title: "Notificações desativadas",
        description: eventId ? "Você não receberá mais lembretes deste evento" : "Notificações push foram desativadas"
      });

      return true;
    } catch (error) {
      console.error('Erro ao cancelar subscrição:', error);
      toast({
        title: "Erro ao desativar notificações",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
      return false;
    }
  };

  const sendNotification = async (payload: {
    title: string;
    body: string;
    userIds?: string[];
    eventId?: string;
    targetAll?: boolean;
    url?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: payload
      });

      if (error) throw error;

      toast({
        title: "Notificação enviada",
        description: `Enviada para ${data.sent} usuários`
      });

      return data;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro ao enviar notificação",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    }
  };

  return {
    supported,
    permission,
    subscription: !!subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification
  };
};

// Utility function
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
}