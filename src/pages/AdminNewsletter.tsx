import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Users, TrendingUp, Download, Send, Search, Filter } from "lucide-react";
import { useNewsletterManagement } from '@/hooks/useNewsletterManagement';

export default function AdminNewsletter() {
  const {
    subscribers,
    stats,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    cityFilter,
    setCityFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    sendNewsletterCampaign,
    exportSubscribers,
    refreshSubscribers
  } = useNewsletterManagement();

  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignContent, setCampaignContent] = useState('');
  const [sendingCampaign, setSendingCampaign] = useState(false);

  const handleSendCampaign = async () => {
    if (!campaignSubject || !campaignContent) return;
    
    setSendingCampaign(true);
    try {
      await sendNewsletterCampaign(campaignSubject, campaignContent);
      setCampaignSubject('');
      setCampaignContent('');
    } finally {
      setSendingCampaign(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'unsubscribed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Newsletter</h1>
        <p className="text-muted-foreground">
          Gerencie assinantes e campanhas de email marketing
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Assinantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_subscribers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.confirmed_subscribers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_subscribers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.growth_rate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
          <TabsTrigger value="campaign">Nova Campanha</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="unsubscribed">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="Porto Alegre">Porto Alegre</SelectItem>
                    <SelectItem value="São Paulo">São Paulo</SelectItem>
                    <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                    <SelectItem value="Florianópolis">Florianópolis</SelectItem>
                    <SelectItem value="Curitiba">Curitiba</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => exportSubscribers('csv')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscribers List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Carregando assinantes...</div>
                </CardContent>
              </Card>
            ) : subscribers.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Nenhum assinante encontrado
                  </div>
                </CardContent>
              </Card>
            ) : (
              subscribers.map((subscriber) => (
                <Card key={subscriber.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{subscriber.email}</span>
                          <Badge variant={getStatusColor(subscriber.status)}>
                            {subscriber.status === 'confirmed' ? 'Confirmado' :
                             subscriber.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </Badge>
                        </div>
                        {subscriber.name && (
                          <p className="text-sm text-muted-foreground">
                            Nome: {subscriber.name}
                          </p>
                        )}
                        {subscriber.city && (
                          <p className="text-sm text-muted-foreground">
                            Cidade: {subscriber.city}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Inscrito em: {new Date(subscriber.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="campaign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova Campanha de Newsletter</CardTitle>
              <CardDescription>
                Envie uma campanha para todos os assinantes confirmados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Digite o assunto da newsletter..."
                  value={campaignSubject}
                  onChange={(e) => setCampaignSubject(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo (HTML)</Label>
                <Textarea
                  id="content"
                  placeholder="Digite o conteúdo HTML da newsletter..."
                  rows={12}
                  value={campaignContent}
                  onChange={(e) => setCampaignContent(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSendCampaign}
                disabled={!campaignSubject || !campaignContent || sendingCampaign}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendingCampaign ? 'Enviando...' : 'Enviar Campanha'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}