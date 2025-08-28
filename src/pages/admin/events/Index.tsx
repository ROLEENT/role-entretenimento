import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useEventManagement } from '@/hooks/useEventManagement';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { withAdminAuth } from '@/components/withAdminAuth';

const cities = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 
  'Brasília', 'Fortaleza', 'Recife', 'Curitiba', 'Porto Alegre', 'Goiânia'
];

function AdminEventsIndex() {
  const navigate = useNavigate();
  const { getEvents, deleteEvent, loading } = useEventManagement();
  
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, cityFilter]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      if (cityFilter !== 'all') {
        filters.city = cityFilter;
      }
      
      const data = await getEvents(filters);
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const success = await deleteEvent(eventId);
      if (success) {
        toast.success('Evento excluído com sucesso');
        fetchEvents();
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  const filteredEvents = events.filter(event => {
    if (!searchTerm) return true;
    return event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           event.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      case 'completed':
        return <Badge variant="outline">Finalizado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Data não definida';
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin-v2/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Eventos</h1>
                <p className="text-muted-foreground">Gerenciar eventos do sistema</p>
              </div>
            </div>
            <Button onClick={() => navigate('/admin-v2/events/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="completed">Finalizado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={fetchEvents}>
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== 'all' || cityFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Comece criando seu primeiro evento.'}
              </p>
              <Button onClick={() => navigate('/admin-v2/events/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{event.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(event.status || 'draft')}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.date_start)}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/evento/${event.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin-v2/events/edit/${event.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o evento "{event.title}"? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEvent(event.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.city}, {event.state}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                      <span>
                        {formatDistanceToNow(new Date(event.updated_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                      {event.price_min !== undefined && (
                        <span>
                          {event.price_min === 0 
                            ? 'Gratuito' 
                            : `R$ ${event.price_min}${event.price_max ? ` - R$ ${event.price_max}` : ''}`
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination placeholder */}
        {filteredEvents.length > 0 && (
          <div className="flex justify-center mt-8">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredEvents.length} evento(s)
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default withAdminAuth(AdminEventsIndex, 'editor');