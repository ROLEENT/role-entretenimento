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
      // Enable Service Worker for push notifications
        // Registrar service worker se necessário
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // VAPID key para admin push notifications
        const vapidPublicKey = 'BN2zF7_7zF8Qo6xGJQJHmAj3JQqF8xA4Nx1-3fHFdGo8_jDhK3nP8pQ1a0yY8ByO4x-F7HRl5cQJQ-XgH8U3eF0'; // VAPID key
        
        const pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        if (!user?.email) {
          throw new Error('Email do usuário não encontrado');
        }

        // Salvar subscrição para admin
        const { error } = await supabase
          .from('admin_push_subscriptions')
          .upsert({
            admin_email: user.email,
            endpoint: pushSubscription.endpoint,
            p256dh: pushSubscription.toJSON().keys?.p256dh,
            auth: pushSubscription.toJSON().keys?.auth,
            is_active: true
          });

        if (error) throw error;

        setSubscription(pushSubscription);
        
        toast({
          title: "Notificações ativadas",
          description: "Você receberá notificações administrativas importantes"
        });

        return true;
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
      // Para admins, cancelar da tabela admin_push_subscriptions
      const { error } = await supabase
        .from('admin_push_subscriptions')
        .update({ is_active: false })
        .eq('admin_email', user.email);

      if (error) throw error;

      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
      }

      toast({
        title: "Notificações desativadas",
        description: "Notificações push foram desativadas"
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