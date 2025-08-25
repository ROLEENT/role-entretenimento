import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Smartphone, CheckCircle, AlertTriangle, BellRing } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPermissionPromptProps {
  trigger?: 'auto' | 'manual';
  onDismiss?: () => void;
  showAsDialog?: boolean;
}

export const NotificationPermissionPrompt = ({ 
  trigger = 'auto',
  onDismiss,
  showAsDialog = false 
}: NotificationPermissionPromptProps) => {
  const { user } = useAuth();
  const { 
    supported: isSupported, 
    permission, 
    subscription: isSubscribed, 
    requestPermission, 
    subscribe,
    sendNotification
  } = usePushNotifications();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'success' | 'test'>('request');

  useEffect(() => {
    // Auto-mostrar apenas se:
    // 1. Usuário logado
    // 2. Notificações suportadas
    // 3. Permissão não foi negada
    // 4. Não está subscrito
    // 5. Trigger é automático
    if (trigger === 'auto' && user && isSupported && permission !== 'denied' && !isSubscribed) {
      // Pequeno delay para não ser intrusivo
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission, isSubscribed, trigger]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleRequestPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
        setStep('success');
        // Auto-fechar após alguns segundos na tela de sucesso
        setTimeout(() => {
          setStep('test');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendNotification({
        title: "🎉 Notificações ativadas!",
        body: "Você receberá atualizações sobre eventos e destaques culturais",
        url: "/"
      });
      handleDismiss();
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      handleDismiss();
    }
  };

  // Não mostrar se:
  // - Não suportado
  // - Usuário não logado
  // - Já subscrito
  // - Permissão negada
  // - Não visível
  if (!isSupported || !user || isSubscribed || permission === 'denied' || !isVisible) {
    return null;
  }

  const content = (
    <div className="space-y-4">
      {step === 'request' && (
        <>
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Ative as notificações</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Seja o primeiro a saber sobre novos eventos e destaques culturais na sua cidade
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Novos eventos na sua cidade</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Lembretes de eventos favoritos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Destaques semanais personalizados</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Ativando..." : "Ativar notificações"}
            </Button>
            <Button 
              variant="ghost"
              onClick={handleDismiss}
              className="px-3"
            >
              Depois
            </Button>
          </div>
        </>
      )}
      
      {step === 'success' && (
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-700">Notificações ativadas!</h3>
            <p className="text-sm text-muted-foreground">
              Preparando sua primeira notificação...
            </p>
          </div>
        </div>
      )}
      
      {step === 'test' && (
        <>
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BellRing className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Vamos testar?</h3>
              <p className="text-sm text-muted-foreground">
                Envie uma notificação de teste para confirmar que tudo está funcionando
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTestNotification}
              className="flex-1"
            >
              Enviar teste
            </Button>
            <Button 
              variant="outline"
              onClick={handleDismiss}
              className="px-3"
            >
              Pular
            </Button>
          </div>
        </>
      )}
    </div>
  );

  if (showAsDialog) {
    return (
      <Dialog open={isVisible} onOpenChange={setIsVisible}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Ativar notificações</DialogTitle>
            <DialogDescription className="sr-only">
              Configure notificações push para receber atualizações
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {content}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};