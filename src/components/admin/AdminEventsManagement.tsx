import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Upload,
  Image as ImageIcon,
  Clock,
  Tag
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_at: string;
  end_at: string | null;
  city: string;
  state: string;
  status: string;
  cover_url: string | null;
  tags: string[];
  venue_id: string | null;
  organizer_id: string | null;
  created_at: string;
  updated_at: string;
  venues?: {
    id: string;
    name: string;
    address: string;
  };
  organizers?: {
    id: string;
    name: string;
  };
}

interface Venue {
  id: string;
  name: string;
  address: string;
}

interface Organizer {
  id: string;
  name: string;
}

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  start_at: string;
  end_at: string;
  city: string;
  venue_id: string;
  organizer_id: string;
  cover_url: string;
  tags: string[];
  status: string;
}

export function AdminEventsManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [cities, setCities] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    description: '',
    start_at: '',
    end_at: '',
    city: '',
    venue_id: '',
    organizer_id: '',
    cover_url: '',
    tags: [],
    status: 'active'
  });

  useEffect(() => {
    fetchEvents();
    fetchVenues();
    fetchOrganizers();
    fetchCities();
  }, [statusFilter, cityFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          venues:venue_id (id, name, address),
          organizers:organizer_id (id, name)
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
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, address')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Error fetching organizers:', error);
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

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, cover_url: publicUrl }));
      toast.success('Imagem enviada com sucesso');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleSaveEvent = async () => {
    try {
      if (!formData.title || !formData.start_at || !formData.city) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (editingEvent) {
        const { error } = await supabase.rpc('admin_update_event', {
          p_event_id: editingEvent.id,
          p_title: formData.title,
          p_slug: formData.slug,
          p_city: formData.city,
          p_venue_id: formData.venue_id || null,
          p_start_at: formData.start_at,
          p_end_at: formData.end_at || null,
          p_organizer_id: formData.organizer_id || null,
          p_cover_url: formData.cover_url || null,
          p_tags: formData.tags,
          p_status: formData.status
        });

        if (error) throw error;
        toast.success('Evento atualizado com sucesso');
      } else {
        const { error } = await supabase.rpc('admin_create_event', {
          p_title: formData.title,
          p_slug: formData.slug,
          p_city: formData.city,
          p_venue_id: formData.venue_id || null,
          p_start_at: formData.start_at,
          p_end_at: formData.end_at || null,
          p_organizer_id: formData.organizer_id || null,
          p_cover_url: formData.cover_url || null,
          p_tags: formData.tags,
          p_status: formData.status
        });

        if (error) throw error;
        toast.success('Evento criado com sucesso');
      }

      setDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Erro ao salvar evento');
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete);

      if (error) throw error;

      toast.success('Evento removido com sucesso');
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao remover evento');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      start_at: '',
      end_at: '',
      city: '',
      venue_id: '',
      organizer_id: '',
      cover_url: '',
      tags: [],
      status: 'active'
    });
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description || '',
      start_at: event.start_at?.split('.')[0] || '',
      end_at: event.end_at?.split('.')[0] || '',
      city: event.city,
      venue_id: event.venue_id || '',
      organizer_id: event.organizer_id || '',
      cover_url: event.cover_url || '',
      tags: event.tags || [],
      status: event.status
    });
    setDialogOpen(true);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organizers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venues?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        
        <Button onClick={() => navigate('/admin/events/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
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

            <Button variant="outline" onClick={fetchEvents}>
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  {event.cover_url && (
                    <img
                      src={event.cover_url}
                      alt={event.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Slug: {event.slug}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description.substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(event.start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.venues?.name || 'Sem local'} - {event.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.organizers?.name || 'Sem organizador'}</span>
                      </div>
                    </div>
                    
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div className="flex gap-1 flex-wrap">
                          {event.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/events/edit/${event.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
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
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}