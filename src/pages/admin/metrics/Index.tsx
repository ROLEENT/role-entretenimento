import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2, TrendingUp, Eye, Users, MapPin, Heart } from 'lucide-react';

const AdminMetricsIndex = () => {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [metrics, setMetrics] = useState({
    reach_thousands: '',
    views_millions: '',
    active_cities: '',
    followers_thousands: ''
  });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadCurrentMetrics();
    loadMetricsHistory();
  }, []);

  const loadCurrentMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('site_metrics')
        .select('*')
        .eq('is_current', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setMetrics({
          reach_thousands: data.reach_thousands?.toString() || '',
          views_millions: data.views_millions?.toString() || '',
          active_cities: data.active_cities?.toString() || '',
          followers_thousands: data.followers_thousands?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas atuais:', error);
    }
  };

  const loadMetricsHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('site_metrics')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUser?.email) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const metricsData = {
        reach_thousands: parseInt(metrics.reach_thousands) || 0,
        views_millions: parseFloat(metrics.views_millions) || 0,
        active_cities: parseInt(metrics.active_cities) || 0,
        followers_thousands: parseInt(metrics.followers_thousands) || 0,
        is_current: true,
        captured_at: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabase
        .from('site_metrics')
        .insert(metricsData);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Métricas atualizadas com sucesso"
      });

      loadCurrentMetrics();
      loadMetricsHistory();
    } catch (error: any) {
      console.error('Erro ao atualizar métricas:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar métricas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Métricas do Site</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário de Atualização */}
        <Card>
          <CardHeader>
            <CardTitle>Atualizar Métricas</CardTitle>
            <CardDescription>
              Digite os novos valores para as métricas do site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reach">Alcance (milhares)</Label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reach"
                      type="number"
                      placeholder="850"
                      value={metrics.reach_thousands}
                      onChange={(e) => handleInputChange('reach_thousands', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="views">Visualizações (milhões)</Label>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="views"
                      type="number"
                      step="0.1"
                      placeholder="2.3"
                      value={metrics.views_millions}
                      onChange={(e) => handleInputChange('views_millions', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cities">Cidades Ativas</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="cities"
                      type="number"
                      placeholder="6"
                      value={metrics.active_cities}
                      onChange={(e) => handleInputChange('active_cities', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followers">Seguidores (milhares)</Label>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="followers"
                      type="number"
                      placeholder="120"
                      value={metrics.followers_thousands}
                      onChange={(e) => handleInputChange('followers_thousands', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Métricas'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Métricas</CardTitle>
            <CardDescription>
              Últimas atualizações das métricas do site
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum histórico encontrado
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg border ${
                      record.is_current ? 'bg-primary/5 border-primary' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-sm">
                          <strong>Alcance:</strong> {record.reach_thousands}k |{' '}
                          <strong>Views:</strong> {record.views_millions}M |{' '}
                          <strong>Cidades:</strong> {record.active_cities} |{' '}
                          <strong>Seguidores:</strong> {record.followers_thousands}k
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(record.captured_at)}
                          {record.is_current && (
                            <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                              Atual
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminMetricsIndex;