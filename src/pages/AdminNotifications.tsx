import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, Users, Bell, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationForm {
  title: string;
  body: string;
  url: string;
  cityFilter: string;
  categoryFilter: string;
}

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  url?: string;
  city_filter?: string;
  category_filter?: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  by_city: Record<string, number>;
}

const cities = [
  'São Paulo',
  'Rio de Janeiro', 
  'Belo Horizonte',
  'Brasília',
  'Salvador',
  'Fortaleza',
  'Recife',
  'Porto Alegre',
  'Curitiba',
  'Goiânia'
];

const categories = [
  { value: 'general', label: 'Geral' },
  { value: 'music', label: 'Música' },
  { value: 'art', label: 'Arte' },
  { value: 'food', label: 'Gastronomia' },
  { value: 'sports', label: 'Esportes' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'business', label: 'Negócios' }
];

const AdminNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SubscriptionStats>({ total: 0, active: 0, by_city: {} });
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    url: '',
    cityFilter: '',
    categoryFilter: ''
  });

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('city_pref, is_active');

      if (error) throw error;

      const total = data?.length || 0;
      const active = data?.filter(sub => sub.is_active).length || 0;
      const by_city: Record<string, number> = {};

      data?.forEach(sub => {
        if (sub.city_pref && sub.is_active) {
          by_city[sub.city_pref] = (by_city[sub.city_pref] || 0) + 1;
        }
      });

      setStats({ total, active, by_city });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!form.title || !form.body) {
      toast({
        title: 'Erro',
        description: 'Título e corpo são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: form.title,
          body: form.body,
          url: form.url || '/',
          cityFilter: form.cityFilter || null,
          categoryFilter: form.categoryFilter || null
        }
      });

      if (error) throw error;

      toast({
        title: 'Notificação Enviada!',
        description: `Enviada para ${data.sent} usuários. ${data.failed} falharam.`,
        variant: data.failed > 0 ? 'destructive' : 'default'
      });

      // Reset form
      setForm({
        title: '',
        body: '',
        url: '',
        cityFilter: '',
        categoryFilter: ''
      });

      // Refresh logs
      fetchLogs();
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar notificação.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedReach = () => {
    if (form.cityFilter) {
      return stats.by_city[form.cityFilter] || 0;
    }
    return stats.active;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Push Notifications</h1>
                <p className="text-muted-foreground">Envie notificações push para usuários</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Assinantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alcance Estimado</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getEstimatedReach()}</div>
              <p className="text-xs text-muted-foreground">
                {form.cityFilter || form.categoryFilter ? 'Com filtros aplicados' : 'Todos os usuários ativos'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cidades Ativas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.by_city).length}</div>
              <p className="text-xs text-muted-foreground">
                Com assinantes ativos
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notification Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Novo evento em São Paulo!"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.title.length}/50 caracteres
                </p>
              </div>

              <div>
                <Label htmlFor="body">Mensagem *</Label>
                <Textarea
                  id="body"
                  value={form.body}
                  onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Ex: Descubra os melhores eventos de música eletrônica..."
                  rows={3}
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.body.length}/120 caracteres
                </p>
              </div>

              <div>
                <Label htmlFor="url">URL de Destino</Label>
                <Input
                  id="url"
                  value={form.url}
                  onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Ex: /events ou https://example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Filtro por Cidade</Label>
                  <Select value={form.cityFilter} onValueChange={(value) => 
                    setForm(prev => ({ ...prev, cityFilter: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as cidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>
                          {city} ({stats.by_city[city] || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Filtro por Categoria</Label>
                  <Select value={form.categoryFilter} onValueChange={(value) => 
                    setForm(prev => ({ ...prev, categoryFilter: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {getEstimatedReach() > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Esta notificação será enviada para aproximadamente <strong>{getEstimatedReach()}</strong> usuários.
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleSendNotification} 
                disabled={loading || !form.title || !form.body}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Notificação'}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Notifications Log */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma notificação enviada ainda
                  </p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{log.title}</h4>
                          <p className="text-xs text-muted-foreground">{log.body}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.status === 'sent' ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enviada
                            </Badge>
                          ) : log.status === 'failed' ? (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Falhou
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {log.city_filter && (
                          <Badge variant="outline" className="text-xs">
                            {log.city_filter}
                          </Badge>
                        )}
                        {log.category_filter && (
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.value === log.category_filter)?.label}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </p>
                      
                      {log.error_message && (
                        <p className="text-xs text-destructive">{log.error_message}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNotifications;