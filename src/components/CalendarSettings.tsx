import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Calendar, Globe, Bell, RefreshCw } from 'lucide-react';
import { usePersonalCalendar } from '@/hooks/usePersonalCalendar';
import { toast } from 'sonner';

interface CalendarSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarSettings: React.FC<CalendarSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const { settings, updateSettings } = usePersonalCalendar();
  const [loading, setLoading] = useState(false);

  const handleSettingChange = async (key: string, value: any) => {
    if (!settings) return;

    setLoading(true);
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCalendarConnect = async () => {
    toast.info('Integração com Google Calendar em desenvolvimento');
    // TODO: Implementar OAuth do Google Calendar
  };

  if (!settings) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurações do Calendário</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Geral</span>
              </CardTitle>
              <CardDescription>
                Configurações básicas do seu calendário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="week-start">Início da semana</Label>
                <Select
                  value={settings.week_starts_on.toString()}
                  onValueChange={(value) => handleSettingChange('week_starts_on', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Segunda-feira</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Fuso horário</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => handleSettingChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Notificações</span>
              </CardTitle>
              <CardDescription>
                Configure lembretes padrão para novos eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="default-reminder">Lembrete padrão</Label>
                <Select
                  value={settings.default_reminder_minutes.toString()}
                  onValueChange={(value) => handleSettingChange('default_reminder_minutes', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos antes</SelectItem>
                    <SelectItem value="15">15 minutos antes</SelectItem>
                    <SelectItem value="30">30 minutos antes</SelectItem>
                    <SelectItem value="60">1 hora antes</SelectItem>
                    <SelectItem value="1440">1 dia antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sincronização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Sincronização</span>
              </CardTitle>
              <CardDescription>
                Conecte com calendários externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Google Calendar */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Google Calendar</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronize seus eventos com o Google Calendar
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.google_calendar_enabled}
                    onCheckedChange={(checked) => {
                      if (checked && !settings.google_calendar_id) {
                        handleGoogleCalendarConnect();
                      } else {
                        handleSettingChange('google_calendar_enabled', checked);
                      }
                    }}
                    disabled={loading}
                  />
                  {settings.google_calendar_enabled && settings.google_calendar_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettingChange('google_calendar_enabled', false)}
                    >
                      Desconectar
                    </Button>
                  )}
                </div>
              </div>

              {!settings.google_calendar_enabled && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 Conecte seu Google Calendar para sincronizar automaticamente seus eventos entre as plataformas.
                  </p>
                </div>
              )}

              {/* Apple Calendar placeholder */}
              <div className="flex items-center justify-between opacity-50">
                <div className="space-y-1">
                  <Label>Apple Calendar</Label>
                  <p className="text-sm text-muted-foreground">
                    Em breve - Sincronização com iCloud Calendar
                  </p>
                </div>
                <Switch disabled />
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarSettings;