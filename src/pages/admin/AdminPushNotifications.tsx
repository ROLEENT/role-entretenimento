import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, Send, Users, Eye, Calendar, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  city?: string;
  type: string;
  status: 'draft' | 'sent' | 'scheduled';
  scheduled_at?: string;
  sent_at?: string;
  recipients_count: number;
  delivered_count: number;
  opened_count: number;
  created_at: string;
}

const AdminPushNotifications = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    city: '',
    type: 'general',
    scheduled_at: '',
    target_audience: 'all'
  });

  const cities = ['Porto Alegre', 'Florianópolis', 'Curitiba', 'São Paulo', 'Rio de Janeiro'];
  
  const notificationTypes = [
    { value: 'general', label: 'Geral' },
    { value: 'event_reminder', label: 'Lembrete de Evento' },
    { value: 'new_events', label: 'Novos Eventos' },
    { value: 'weekly_highlights', label: 'Destaques da Semana' },
    { value: 'promotion', label: 'Promoção' }
  ];

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    try {
      setSending(true);
      
      const campaignData = {
        title: formData.title,
        message: formData.message,
        city: formData.city || null,
        type: formData.type,
        status: formData.scheduled_at ? 'scheduled' : 'draft',
        scheduled_at: formData.scheduled_at || null,
        target_audience: formData.target_audience
      };

      const { data, error } = await supabase
        .from('notification_campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;

      // Se não está agendada, enviar imediatamente
      if (!formData.scheduled_at) {
        await sendCampaign(data.id);
      }

      toast.success(
        formData.scheduled_at 
          ? 'Campanha agendada com sucesso!' 
          : 'Campanha enviada com sucesso!'
      );
      
      resetForm();
      fetchCampaigns();
    } catch (error: any) {
      console.error('Erro ao criar campanha:', error);
      toast.error(error.message || 'Erro ao criar campanha');
    } finally {
      setSending(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: { campaignId }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erro ao enviar campanha:', error);
      throw error;
    }
  };

  const handleSendNow = async (campaign: NotificationCampaign) => {
    if (!confirm('Tem certeza que deseja enviar esta campanha agora?')) return;

    try {
      setSending(true);
      await sendCampaign(campaign.id);
      toast.success('Campanha enviada com sucesso!');
      fetchCampaigns();
    } catch (error: any) {
      console.error('Erro ao enviar campanha:', error);
      toast.error(error.message || 'Erro ao enviar campanha');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      city: '',
      type: 'general',
      scheduled_at: '',
      target_audience: 'all'
    });
    setShowCreateForm(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: 'Rascunho' },
      sent: { variant: 'default' as const, label: 'Enviado' },
      scheduled: { variant: 'outline' as const, label: 'Agendado' }
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Push Notifications</h1>
                <p className="text-muted-foreground">Gerencie campanhas de notificação push</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/admin/notifications/analytics')}>
                <Eye className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button onClick={() => setShowCreateForm(true)}>
                <Bell className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nova Campanha de Push Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título da notificação"
                      maxLength={50}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.title.length}/50 caracteres
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Mensagem *</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Conteúdo da notificação"
                    rows={4}
                    maxLength={150}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.message.length}/150 caracteres
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Público-alvo</label>
                    <Select value={formData.target_audience} onValueChange={(value) => setFormData(prev => ({ ...prev, target_audience: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os usuários</SelectItem>
                        <SelectItem value="city_specific">Por cidade</SelectItem>
                        <SelectItem value="active_users">Usuários ativos</SelectItem>
                        <SelectItem value="event_followers">Seguidores de eventos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.target_audience === 'city_specific' && (
                    <div>
                      <label className="text-sm font-medium">Cidade</label>
                      <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Agendar envio</label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={sending}>
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? 'Criando...' : formData.scheduled_at ? 'Agendar' : 'Enviar Agora'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-lg">Carregando campanhas...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const statusInfo = getStatusBadge(campaign.status);
              
              return (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{campaign.title}</h3>
                          <Badge {...statusInfo}>
                            {statusInfo.label}
                          </Badge>
                          {campaign.city && (
                            <Badge variant="outline">{campaign.city}</Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{campaign.message}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{campaign.recipients_count} destinatários</span>
                          </div>
                          
                          {campaign.delivered_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Send className="h-4 w-4" />
                              <span>{campaign.delivered_count} entregues</span>
                            </div>
                          )}
                          
                          {campaign.opened_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{campaign.opened_count} abertas</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {campaign.sent_at 
                                ? `Enviado em ${new Date(campaign.sent_at).toLocaleDateString('pt-BR')}`
                                : campaign.scheduled_at
                                ? `Agendado para ${new Date(campaign.scheduled_at).toLocaleDateString('pt-BR')}`
                                : `Criado em ${new Date(campaign.created_at).toLocaleDateString('pt-BR')}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendNow(campaign)}
                            disabled={sending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/notifications/${campaign.id}/analytics`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {campaign.status === 'sent' && campaign.delivered_count > 0 && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm">
                          <strong>Performance:</strong>
                          <span className="ml-2">
                            Taxa de entrega: {((campaign.delivered_count / campaign.recipients_count) * 100).toFixed(1)}%
                          </span>
                          {campaign.opened_count > 0 && (
                            <span className="ml-4">
                              Taxa de abertura: {((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {campaigns.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira campanha de push notification
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Criar Campanha
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminPushNotifications;