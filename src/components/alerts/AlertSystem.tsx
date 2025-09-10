import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  MapPin, 
  User, 
  Calendar, 
  Settings, 
  X,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'city' | 'artist' | 'venue' | 'organizer' | 'category';
  name: string;
  identifier: string; // city name, artist id, etc.
  enabled: boolean;
  lastNotified?: string;
}

export function AlertSystem() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserAlerts();
    }
  }, [user]);

  const loadUserAlerts = async () => {
    try {
      // In a real implementation, this would load from a user_alerts table
      const savedAlerts = localStorage.getItem(`alerts_${user.id}`);
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const saveAlerts = (newAlerts: Alert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem(`alerts_${user.id}`, JSON.stringify(newAlerts));
  };

  const addAlert = (type: Alert['type'], name: string, identifier: string) => {
    const newAlert: Alert = {
      id: `${type}_${identifier}_${Date.now()}`,
      type,
      name,
      identifier,
      enabled: true
    };

    const updatedAlerts = [...alerts, newAlert];
    saveAlerts(updatedAlerts);
    toast.success(`Alerta criado para ${name}`);
  };

  const toggleAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId 
        ? { ...alert, enabled: !alert.enabled }
        : alert
    );
    saveAlerts(updatedAlerts);
    
    const alert = alerts.find(a => a.id === alertId);
    toast.success(`Alerta ${alert?.enabled ? 'desativado' : 'ativado'} para ${alert?.name}`);
  };

  const removeAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    const updatedAlerts = alerts.filter(a => a.id !== alertId);
    saveAlerts(updatedAlerts);
    toast.success(`Alerta removido para ${alert?.name}`);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'city': return <MapPin className="h-4 w-4" />;
      case 'artist': return <User className="h-4 w-4" />;
      case 'venue': return <MapPin className="h-4 w-4" />;
      case 'organizer': return <User className="h-4 w-4" />;
      case 'category': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'city': return 'Cidade';
      case 'artist': return 'Artista';
      case 'venue': return 'Local';
      case 'organizer': return 'Organizador';
      case 'category': return 'Categoria';
      default: return type;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Sistema de Alertas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Faça login para configurar alertas personalizados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Meus Alertas
          {alerts.filter(a => a.enabled).length > 0 && (
            <Badge variant="secondary">
              {alerts.filter(a => a.enabled).length}
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Setup */}
        {alerts.length === 0 && (
          <div className="text-center py-6">
            <Bell className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-2">Configure seus alertas</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Receba notificações sobre novos eventos nas suas cidades e artistas favoritos
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAlert('city', 'São Paulo', 'sao-paulo')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                São Paulo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAlert('city', 'Rio de Janeiro', 'rio-de-janeiro')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Rio de Janeiro
              </Button>
            </div>
          </div>
        )}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Alertas Configurados</h4>
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{alert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getAlertTypeLabel(alert.type)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAlert(alert.id)}
                    className="p-1"
                  >
                    {alert.enabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAlert(alert.id)}
                    className="p-1 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Newsletter Subscription */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">Newsletter Semanal</h4>
              <p className="text-xs text-muted-foreground">
                Resumo dos melhores eventos da semana
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Ativar
            </Button>
          </div>
        </div>

        {/* Add More Alerts */}
        {showSettings && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Adicionar Alertas</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAlert('city', 'Belo Horizonte', 'belo-horizonte')}
              >
                BH
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAlert('city', 'Curitiba', 'curitiba')}
              >
                Curitiba
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAlert('category', 'Shows', 'shows')}
              >
                Shows
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAlert('category', 'Teatro', 'teatro')}
              >
                Teatro
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}