import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { MapPin, Music, DollarSign, Bell, Eye, Shield, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from '@/hooks/useUserAuth';
import { toast } from '@/hooks/use-toast';

interface UserPreferences {
  id?: string;
  user_id: string;
  favorite_cities: string[];
  favorite_genres: string[];
  price_range_min: number;
  price_range_max: number;
  notifications_enabled: boolean;
  email_notifications: boolean;
  weekly_newsletter: boolean;
  event_reminders: boolean;
  profile_visibility: 'public' | 'private';
  show_attended_events: boolean;
  accessibility_needs: string[];
}

const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
  'Curitiba', 'Porto Alegre', 'Recife', 'Fortaleza', 'Florianópolis'
];

const GENRES = [
  'Eletrônica', 'Techno', 'House', 'Funk', 'Rock', 'Pop', 'Hip Hop',
  'Reggae', 'Samba', 'MPB', 'Jazz', 'Blues', 'Metal', 'Indie'
];

const ACCESSIBILITY_OPTIONS = [
  'Acessibilidade física', 'Intérprete de Libras', 'Audiodescrição',
  'Espaço para cadeirante', 'Banheiro acessível'
];

export function UserPreferences() {
  const { user } = useUserAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: user?.id || '',
    favorite_cities: [],
    favorite_genres: [],
    price_range_min: 0,
    price_range_max: 500,
    notifications_enabled: true,
    email_notifications: true,
    weekly_newsletter: true,
    event_reminders: true,
    profile_visibility: 'public',
    show_attended_events: true,
    accessibility_needs: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(preferences);

      if (error) throw error;

      toast({
        title: "Preferências salvas",
        description: "Suas preferências foram atualizadas com sucesso"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar preferências",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleCity = (city: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_cities: prev.favorite_cities.includes(city)
        ? prev.favorite_cities.filter(c => c !== city)
        : [...prev.favorite_cities, city]
    }));
  };

  const toggleGenre = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      favorite_genres: prev.favorite_genres.includes(genre)
        ? prev.favorite_genres.filter(g => g !== genre)
        : [...prev.favorite_genres, genre]
    }));
  };

  const toggleAccessibility = (option: string) => {
    setPreferences(prev => ({
      ...prev,
      accessibility_needs: prev.accessibility_needs.includes(option)
        ? prev.accessibility_needs.filter(a => a !== option)
        : [...prev.accessibility_needs, option]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse h-4 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-3">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cidades Favoritas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Cidades Favoritas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione as cidades onde você gostaria de receber notificações sobre eventos
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CITIES.map(city => (
              <Badge
                key={city}
                variant={preferences.favorite_cities.includes(city) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCity(city)}
              >
                {city}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gêneros Favoritos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Gêneros Favoritos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha os estilos musicais que mais te interessam
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {GENRES.map(genre => (
              <Badge
                key={genre}
                variant={preferences.favorite_genres.includes(genre) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Faixa de Preço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Faixa de Preço Preferida
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Defina o range de preços que você costuma pagar em eventos
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min-price">Preço Mínimo (R$)</Label>
              <Input
                id="min-price"
                type="number"
                value={preferences.price_range_min}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  price_range_min: parseInt(e.target.value) || 0
                }))}
              />
            </div>
            <div>
              <Label htmlFor="max-price">Preço Máximo (R$)</Label>
              <Input
                id="max-price"
                type="number"
                value={preferences.price_range_max}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  price_range_max: parseInt(e.target.value) || 500
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acessibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Necessidades de Acessibilidade
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Informe suas necessidades para receber apenas eventos acessíveis
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ACCESSIBILITY_OPTIONS.map(option => (
              <Badge
                key={option}
                variant={preferences.accessibility_needs.includes(option) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleAccessibility(option)}
              >
                {option}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações gerais</Label>
                <p className="text-sm text-muted-foreground">Receber notificações sobre novos eventos</p>
              </div>
              <Switch
                checked={preferences.notifications_enabled}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  notifications_enabled: checked
                }))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações por email</Label>
                <p className="text-sm text-muted-foreground">Receber emails sobre eventos relevantes</p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  email_notifications: checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Newsletter semanal</Label>
                <p className="text-sm text-muted-foreground">Resumo dos melhores eventos da semana</p>
              </div>
              <Switch
                checked={preferences.weekly_newsletter}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  weekly_newsletter: checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Lembretes de eventos</Label>
                <p className="text-sm text-muted-foreground">Lembrete 1 dia antes dos eventos salvos</p>
              </div>
              <Switch
                checked={preferences.event_reminders}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  event_reminders: checked
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Perfil público</Label>
                <p className="text-sm text-muted-foreground">Permitir que outros vejam seu perfil</p>
              </div>
              <Switch
                checked={preferences.profile_visibility === 'public'}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  profile_visibility: checked ? 'public' : 'private'
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Mostrar eventos que fui</Label>
                <p className="text-sm text-muted-foreground">Exibir publicamente eventos que você marcou presença</p>
              </div>
              <Switch
                checked={preferences.show_attended_events}
                onCheckedChange={(checked) => setPreferences(prev => ({
                  ...prev,
                  show_attended_events: checked
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
}