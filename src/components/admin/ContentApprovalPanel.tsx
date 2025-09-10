import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingContent {
  id: string;
  title?: string;
  stage_name?: string;
  name?: string;
  approval_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  type: 'event' | 'artist' | 'venue' | 'organizer';
}

export const ContentApprovalPanel = () => {
  const [pendingEvents, setPendingEvents] = useState<PendingContent[]>([]);
  const [pendingArtists, setPendingArtists] = useState<PendingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    setLoading(true);
    try {
      // Fetch pending events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, approval_status, created_at')
        .in('approval_status', ['pending_review', 'draft'])
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch pending artists
      const { data: artists, error: artistsError } = await supabase
        .from('artists')
        .select('id, stage_name, approval_status, created_at')
        .in('approval_status', ['pending_review', 'draft'])
        .order('created_at', { ascending: false });

      if (artistsError) throw artistsError;

      setPendingEvents(events?.map(e => ({ ...e, type: 'event' as const })) || []);
      setPendingArtists(artists?.map(a => ({ ...a, type: 'artist' as const })) || []);
    } catch (error) {
      console.error('Error fetching pending content:', error);
      toast.error('Erro ao carregar conteúdo pendente');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, type: string, status: 'approved' | 'rejected') => {
    try {
      const table = type === 'event' ? 'events' : 'artists';
      const { error } = await supabase
        .from(table)
        .update({
          approval_status: status,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`${type === 'event' ? 'Evento' : 'Artista'} ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso`);
      setReviewNotes('');
      fetchPendingContent();
    } catch (error) {
      console.error('Error updating approval status:', error);
      toast.error('Erro ao atualizar status de aprovação');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending_review': return <Clock className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const renderContentCard = (item: PendingContent) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {item.title || item.stage_name || item.name}
          </CardTitle>
          <Badge className={getStatusColor(item.approval_status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(item.approval_status)}
              {item.approval_status === 'pending_review' ? 'Pendente' : 
               item.approval_status === 'draft' ? 'Rascunho' : 
               item.approval_status}
            </div>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Criado em {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Notas de revisão (opcional)"
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          className="min-h-[80px]"
        />
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleApproval(item.id, item.type, 'approved')}
            className="flex-1"
            variant="default"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar
          </Button>
          <Button
            onClick={() => handleApproval(item.id, item.type, 'rejected')}
            className="flex-1"
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Carregando conteúdo pendente...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Aprovação de Conteúdo</h2>
        <Button onClick={fetchPendingContent} variant="outline">
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            Eventos
            {pendingEvents.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingEvents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="artists" className="flex items-center gap-2">
            Artistas
            {pendingArtists.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingArtists.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum evento pendente de aprovação
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingEvents.map(renderContentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="artists" className="space-y-4">
          {pendingArtists.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum artista pendente de aprovação
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingArtists.map(renderContentCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};