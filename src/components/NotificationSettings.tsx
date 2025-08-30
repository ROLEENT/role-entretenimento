import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Bell, BellOff, Check, X, Clock, Settings, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferences {
  new_events: boolean;
  event_reminders: boolean;
  comment_replies: boolean;
  weekly_highlights: boolean;
  allowed_start_hour: number;
  allowed_end_hour: number;
  max_daily_notifications: number;
  preferred_cities: string[];
  interested_categories: string[];
}

export function NotificationSettings() {
  const { user } = useAuth();
  const { supported, permission, subscription, requestPermission, subscribe, unsubscribe } = usePushNotifications();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    new_events: true,
    event_reminders: true,
    comment_replies: true,
    weekly_highlights: true,
    allowed_start_hour: 9,
    allowed_end_hour: 22,
    max_daily_notifications: 3,
    preferred_cities: [],
    interested_categories: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar preferências do usuário
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          new_events: data.new_events,
          event_reminders: data.event_reminders,
          comment_replies: data.comment_replies,
          weekly_highlights: data.weekly_highlights,
          allowed_start_hour: data.allowed_start_hour,
          allowed_end_hour: data.allowed_end_hour,
          max_daily_notifications: data.max_daily_notifications,
          preferred_cities: data.preferred_cities || [],
          interested_categories: data.interested_categories || []
        });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

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
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await unsubscribe();
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences
        });

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "Erro ao salvar preferências",
          description: "Tente novamente mais tarde",
          variant: "destructive"
        });
        // Reverter mudança em caso de erro
        setPreferences(preferences);
      } else {
        toast({
          title: "Preferências atualizadas",
          description: "Suas configurações foram salvas"
        });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getPermissionStatus = () => {
    if (!supported) return { icon: AlertCircle, text: "Não suportado", variant: "secondary" as const };
    if (permission === 'granted' && subscription) return { icon: CheckCircle, text: "Ativado", variant: "default" as const };
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
          Receba atualizações sobre eventos, agenda e atividades
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
                {subscription ? 'Recebendo notificações' : 'Não configurado'}
              </p>
            </div>
          </div>
          
          {!supported ? (
            <Badge variant="secondary">Não suportado</Badge>
          ) : permission === 'denied' ? (
            <Badge variant="destructive">Bloqueado pelo navegador</Badge>
          ) : (
            <Button
              onClick={subscription ? handleUnsubscribe : handlePermissionRequest}
              disabled={isLoading}
              variant={subscription ? "outline" : "default"}
            >
              {isLoading ? "Carregando..." : subscription ? "Desativar" : "Ativar"}
            </Button>
          )}
        </div>

        {/* Preferências detalhadas */}
        {subscription && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h3 className="font-medium">Preferências de Notificação</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Novos eventos</label>
                  <p className="text-xs text-muted-foreground">
                    Receba notificações quando novos eventos forem criados na sua cidade
                  </p>
                </div>
                <Switch
                  checked={preferences.new_events}
                  onCheckedChange={(checked) => updatePreference('new_events', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Lembretes de eventos</label>
                  <p className="text-xs text-muted-foreground">
                    Receba lembretes 1 hora antes dos eventos que você favoritou
                  </p>
                </div>
                <Switch
                  checked={preferences.event_reminders}
                  onCheckedChange={(checked) => updatePreference('event_reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Respostas aos comentários</label>
                  <p className="text-xs text-muted-foreground">
                    Receba notificações quando alguém responder seus comentários
                  </p>
                </div>
                <Switch
                  checked={preferences.comment_replies}
                  onCheckedChange={(checked) => updatePreference('comment_replies', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Agenda semanal</label>
                  <p className="text-xs text-muted-foreground">
                    Receba um resumo dos melhores eventos toda segunda-feira
                  </p>
                </div>
                <Switch
                  checked={preferences.weekly_highlights}
                  onCheckedChange={(checked) => updatePreference('weekly_highlights', checked)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horários permitidos: {preferences.allowed_start_hour}h às {preferences.allowed_end_hour}h
                  </label>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Início: {preferences.allowed_start_hour}h</label>
                      <Slider
                        value={[preferences.allowed_start_hour]}
                        onValueChange={(value) => updatePreference('allowed_start_hour', value[0])}
                        max={23}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Fim: {preferences.allowed_end_hour}h</label>
                      <Slider
                        value={[preferences.allowed_end_hour]}
                        onValueChange={(value) => updatePreference('allowed_end_hour', value[0])}
                        max={23}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Máximo de notificações por dia: {preferences.max_daily_notifications}
                  </label>
                  <Slider
                    value={[preferences.max_daily_notifications]}
                    onValueChange={(value) => updatePreference('max_daily_notifications', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
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