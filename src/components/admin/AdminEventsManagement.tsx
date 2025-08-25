import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  description: string;
  date_start: string;
  date_end: string | null;
  city: string;
  state: string;
  status: string;
  image_url: string | null;
  created_at: string;
  venue?: {
    name: string;
    address: string;
  };
  organizer?: {
    name: string;
  };
  _count?: {
    checkins: number;
    reviews: number;
    favorites: number;
  };
}

interface BulkAction {
  type: 'approve' | 'reject' | 'delete';
  label: string;
  icon: React.ComponentType<any>;
  variant: 'default' | 'destructive';
}

export function AdminEventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchCities();
  }, [statusFilter, cityFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          venues:venue_id (name, address),
          organizers:organizer_id (name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (cityFilter !== 'all') {
        query = query.eq('city', cityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch engagement metrics for each event
      const eventsWithMetrics = await Promise.all(
        (data || []).map(async (event) => {
          const [checkinsResult, reviewsResult, favoritesResult] = await Promise.all([
            supabase.from('event_checkins').select('id').eq('event_id', event.id),
            supabase.from('event_reviews').select('id').eq('event_id', event.id),
            supabase.from('event_favorites').select('id').eq('event_id', event.id)
          ]);

          return {
            ...event,
            _count: {
              checkins: checkinsResult.data?.length || 0,
              reviews: reviewsResult.data?.length || 0,
              favorites: favoritesResult.data?.length || 0
            }
          };
        })
      );

      setEvents(eventsWithMetrics);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('city')
        .order('city');

      if (error) throw error;

      const uniqueCities = [...new Set(data?.map(d => d.city) || [])];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      toast.success(`Evento ${newStatus === 'active' ? 'aprovado' : 'rejeitado'} com sucesso`);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Erro ao atualizar status do evento');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Evento removido com sucesso');
      fetchEvents();
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao remover evento');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedEvents.length === 0) return;

    try {
      let updates: any = {};
      let successMessage = '';

      switch (action) {
        case 'approve':
          updates = { status: 'active' };
          successMessage = `${selectedEvents.length} eventos aprovados`;
          break;
        case 'reject':
          updates = { status: 'rejected' };
          successMessage = `${selectedEvents.length} eventos rejeitados`;
          break;
        case 'delete':
          if (confirm(`Tem certeza que deseja remover ${selectedEvents.length} eventos?`)) {
            await supabase
              .from('events')
              .delete()
              .in('id', selectedEvents);
            successMessage = `${selectedEvents.length} eventos removidos`;
          }
          break;
      }

      if (action !== 'delete') {
        await supabase
          .from('events')
          .update(updates)
          .in('id', selectedEvents);
      }

      toast.success(successMessage);
      setSelectedEvents([]);
      setShowBulkActions(false);
      fetchEvents();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Erro ao executar ação em lote');
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const bulkActions: BulkAction[] = [
    { type: 'approve', label: 'Aprovar Selecionados', icon: CheckCircle, variant: 'default' },
    { type: 'reject', label: 'Rejeitar Selecionados', icon: XCircle, variant: 'default' },
    { type: 'delete', label: 'Remover Selecionados', icon: Trash2, variant: 'destructive' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestão de Eventos</h2>
          <p className="text-muted-foreground">
            Gerencie todos os eventos da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowBulkActions(!showBulkActions)}>
            <Settings className="h-4 w-4 mr-2" />
            Ações em Lote
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Cidades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedEvents(filteredEvents.map(e => e.id));
                  } else {
                    setSelectedEvents([]);
                  }
                }}
              />
              <label className="text-sm">
                Selecionar Todos ({selectedEvents.length})
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && selectedEvents.length > 0 && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedEvents.length} evento(s) selecionado(s):
              </span>
              {bulkActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.type}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleBulkAction(action.type)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="grid gap-4">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum evento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEvents([...selectedEvents, event.id]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                      }
                    }}
                  />
                  
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description?.substring(0, 150)}...
                        </p>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(event.date_start), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venue?.name || 'Sem local'} - {event.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.organizer?.name || 'Sem organizador'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {event._count?.checkins || 0} check-ins
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {event._count?.reviews || 0} avaliações
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event._count?.favorites || 0} favoritos
                      </span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'active')}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(event.id, 'rejected')}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => {
                          setEventToDelete(event.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eventToDelete && handleDeleteEvent(eventToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}