import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Users, 
  Send, 
  Plus, 
  Eye, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  city?: string;
  subscribed_at: string;
  confirmed_at?: string;
  preferences: {
    events?: boolean;
    highlights?: boolean;
    weekly?: boolean;
  };
}

interface Campaign {
  id: string;
  title: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  created_at: string;
  sent_at?: string;
}

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    unsubscribed: 0
  });
  
  // New campaign form
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    subject: "",
    content_html: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSubscribers(),
        loadCampaigns()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da newsletter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async () => {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      throw error;
    }

    setSubscribers(data || []);

    // Calculate stats
    const total = data?.length || 0;
    const confirmed = data?.filter(s => s.status === 'confirmed').length || 0;
    const pending = data?.filter(s => s.status === 'pending').length || 0;
    const unsubscribed = data?.filter(s => s.status === 'unsubscribed').length || 0;

    setStats({ total, confirmed, pending, unsubscribed });
  };

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    setCampaigns(data || []);
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCampaign.title || !newCampaign.subject || !newCampaign.content_html) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a campanha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .insert({
          title: newCampaign.title,
          subject: newCampaign.subject,
          content_html: newCampaign.content_html,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Campanha criada!",
        description: "A campanha foi salva como rascunho",
      });

      setNewCampaign({ title: "", subject: "", content_html: "" });
      await loadCampaigns();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campanha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'unsubscribed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unsubscribed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Newsletter</h1>
        <Button onClick={loadData} disabled={loading}>
          <Mail className="mr-2 h-4 w-4" />
          {loading ? "Carregando..." : "Atualizar"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inscritos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descadastrados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unsubscribed}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers">Inscritos</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="new-campaign">Nova Campanha</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Inscritos</CardTitle>
              <CardDescription>
                Gerencie todos os inscritos da newsletter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscribers.map((subscriber) => (
                  <div
                    key={subscriber.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(subscriber.status)}
                      <div>
                        <p className="font-medium">{subscriber.name || subscriber.email}</p>
                        {subscriber.name && (
                          <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Inscrito em {format(new Date(subscriber.subscribed_at), "dd/MM/yyyy", { locale: ptBR })}
                          {subscriber.city && ` • ${subscriber.city}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(subscriber.status)}>
                        {subscriber.status === 'confirmed' && 'Confirmado'}
                        {subscriber.status === 'pending' && 'Pendente'}
                        {subscriber.status === 'unsubscribed' && 'Descadastrado'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {subscribers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum inscrito encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas de Newsletter</CardTitle>
              <CardDescription>
                Histórico e status das campanhas enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{campaign.title}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status === 'draft' && 'Rascunho'}
                          {campaign.status === 'sent' && 'Enviado'}
                          {campaign.status === 'sending' && 'Enviando'}
                          {campaign.status === 'failed' && 'Falhou'}
                          {campaign.status === 'scheduled' && 'Agendado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                        <span>Criado: {format(new Date(campaign.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        {campaign.sent_at && (
                          <span>Enviado: {format(new Date(campaign.sent_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                        )}
                      </div>
                      {campaign.total_recipients > 0 && (
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>Destinatários: {campaign.total_recipients}</span>
                          <span>Enviados: {campaign.total_sent}</span>
                          <span>Abertos: {campaign.total_opened}</span>
                          <span>Cliques: {campaign.total_clicked}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campaign.status === 'draft' && (
                        <Button size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma campanha encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-campaign">
          <Card>
            <CardHeader>
              <CardTitle>Nova Campanha</CardTitle>
              <CardDescription>
                Crie uma nova campanha de newsletter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createCampaign} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título da Campanha</label>
                  <Input
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Destaques da Semana"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Assunto do Email</label>
                  <Input
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: 🎭 Os melhores eventos desta semana"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Conteúdo HTML</label>
                  <Textarea
                    value={newCampaign.content_html}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, content_html: e.target.value }))}
                    placeholder="Insira o HTML do email..."
                    rows={10}
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Rascunho
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNewsletter;