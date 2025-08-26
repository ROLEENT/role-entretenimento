import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Calendar, MapPin, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Event {
  id: string;
  title: string;
  description: string;
  date_start: string;
  date_end: string | null;
  city: string;
  state: string;
  status: string;
  price_min: number | null;
  price_max: number | null;
  image_url: string | null;
  created_at: string;
}

const AdminEventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Disable RLS for admin operations
      const { data, error } = await supabase
        .rpc('get_events_admin_data')
        .select('*')
        .order('created_at', { ascending: false });

      // Fallback to direct query if RPC doesn't exist
      if (error && error.code === '42883') {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        setEvents(fallbackData || []);
      } else {
        if (error) throw error;
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Evento deletado com sucesso');
      fetchEvents();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast.error('Erro ao deletar evento');
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      toast.success(`Evento ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`);
      fetchEvents();
    } catch (error) {
      console.error('Erro ao alterar status do evento:', error);
      toast.error('Erro ao alterar status do evento');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os eventos da plataforma
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/event/create">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar eventos por título ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Tente uma busca diferente' : 'Comece criando seu primeiro evento'}
            </p>
            {!searchTerm && (
              <Button asChild className="mt-4">
                <Link to="/admin/event/create">Criar Evento</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {event.title}
                      <Badge className={getStatusColor(event.status)}>
                        {event.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {event.description?.substring(0, 150)}
                      {event.description && event.description.length > 150 ? '...' : ''}
                    </CardDescription>
                  </div>
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(event.date_start)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {event.city}, {event.state}
                    </span>
                  </div>
                  <div className="text-sm">
                    {event.price_min !== null && event.price_max !== null ? (
                      <span>R$ {event.price_min} - R$ {event.price_max}</span>
                    ) : event.price_min !== null ? (
                      <span>A partir de R$ {event.price_min}</span>
                    ) : (
                      <span>Gratuito</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/evento/${event.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleEventStatus(event.id, event.status)}
                  >
                    {event.status === 'active' ? 'Desativar' : 'Ativar'}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O evento será permanentemente deletado.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteEvent(event.id)}>
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEventManagement;