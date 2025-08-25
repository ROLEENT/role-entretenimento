import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferences {
  newEvents: boolean;
  eventReminders: boolean;
  commentReplies: boolean;
  weeklyHighlights: boolean;
  allowedHours: {
    start: string;
    end: string;
  };
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { 
    supported: isSupported, 
    permission, 
    subscription: isSubscribed, 
    requestPermission, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newEvents: true,
    eventReminders: true,
    commentReplies: true,
    weeklyHighlights: false,
    allowedHours: {
      start: '08:00',
      end: '22:00'
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Carregar preferências salvas (implementar com Supabase)
  useEffect(() => {
    // TODO: Carregar preferências do usuário do banco de dados
  }, [user]);

  const handlePermissionRequest = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para ativar notificações",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá atualizações sobre eventos e destaques",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao ativar notificações",
        description: "Tente novamente ou verifique as configurações do navegador",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribe();
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais notificações push",
      });
    } catch (error) {
      toast({
        title: "Erro ao desativar notificações",
        description: "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key: keyof Omit<NotificationPreferences, 'allowedHours'>, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // TODO: Salvar no banco de dados
  };

  const getPermissionStatus = () => {
    if (!isSupported) return { icon: AlertCircle, text: "Não suportado", variant: "secondary" as const };
    if (permission === 'granted' && isSubscribed) return { icon: CheckCircle, text: "Ativado", variant: "default" as const };
    if (permission === 'denied') return { icon: BellOff, text: "Bloqueado", variant: "destructive" as const };
    return { icon: Bell, text: "Desativado", variant: "outline" as const };
  };

  const status = getPermissionStatus();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações Push</CardTitle>
          </div>
          <CardDescription>
            Faça login para configurar suas notificações
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações Push</CardTitle>
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1">
            <status.icon className="h-3 w-3" />
            {status.text}
          </Badge>
        </div>
        <CardDescription>
          Receba atualizações sobre eventos, destaques e atividades
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status e controle principal */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Notificações Push</h3>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? 'Recebendo notificações' : 'Não configurado'}
              </p>
            </div>
          </div>
          
          {!isSupported ? (
            <Badge variant="secondary">Não suportado</Badge>
          ) : permission === 'denied' ? (
            <Badge variant="destructive">Bloqueado pelo navegador</Badge>
          ) : (
            <Button
              onClick={isSubscribed ? handleUnsubscribe : handlePermissionRequest}
              disabled={isLoading}
              variant={isSubscribed ? "outline" : "default"}
            >
              {isLoading ? "Carregando..." : isSubscribed ? "Desativar" : "Ativar"}
            </Button>
          )}
        </div>

        {/* Preferências detalhadas */}
        {isSubscribed && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="font-medium">Preferências</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novos eventos</p>
                  <p className="text-sm text-muted-foreground">
                    Eventos na sua cidade
                  </p>
                </div>
                <Switch
                  checked={preferences.newEvents}
                  onCheckedChange={(checked) => updatePreference('newEvents', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lembretes</p>
                  <p className="text-sm text-muted-foreground">
                    Eventos favoritos começando em breve
                  </p>
                </div>
                <Switch
                  checked={preferences.eventReminders}
                  onCheckedChange={(checked) => updatePreference('eventReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Respostas</p>
                  <p className="text-sm text-muted-foreground">
                    Respostas aos seus comentários
                  </p>
                </div>
                <Switch
                  checked={preferences.commentReplies}
                  onCheckedChange={(checked) => updatePreference('commentReplies', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Destaques semanais</p>
                  <p className="text-sm text-muted-foreground">
                    Resumo semanal dos melhores eventos
                  </p>
                </div>
                <Switch
                  checked={preferences.weeklyHighlights}
                  onCheckedChange={(checked) => updatePreference('weeklyHighlights', checked)}
                />
              </div>
            </div>
            
            {/* Horários permitidos */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Horário das notificações</p>
              <p className="text-xs text-muted-foreground">
                Entre {preferences.allowedHours.start} e {preferences.allowedHours.end}
              </p>
            </div>
          </div>
        )}
        
        {/* Informações adicionais */}
        {permission === 'denied' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              <strong>Notificações bloqueadas:</strong> Para ativar, acesse as configurações do navegador e permita notificações para este site.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};