import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import LazyImage from '@/components/LazyImage';

interface Highlight {
  id: string;
  city: string;
  event_title: string;
  venue: string;
  ticket_url: string | null;
  role_text: string;
  selection_reasons: string[];
  image_url: string;
  photo_credit: string | null;
  event_date: string | null;
  sort_order: number;
  like_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminHighlightsIndex() {
  const { adminUser, loading: authLoading } = useAdminAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const cities = [
    { value: 'porto_alegre', label: 'Porto Alegre' },
    { value: 'sao_paulo', label: 'São Paulo' },
    { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
    { value: 'florianopolis', label: 'Florianópolis' },
    { value: 'curitiba', label: 'Curitiba' }
  ];

  const fetchHighlights = async () => {
    if (!adminUser?.email) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_get_highlights', {
        p_admin_email: adminUser.email,
        p_city: selectedCity || null,
        p_search: searchTerm || null
      });

      if (error) throw error;
      setHighlights((data as Highlight[]) || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os destaques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser?.email) {
      fetchHighlights();
    }
  }, [adminUser?.email, selectedCity, searchTerm]);

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    if (!adminUser?.email) return;

    try {
      const { error } = await supabase.rpc('admin_toggle_highlight_published', {
        p_admin_email: adminUser.email,
        p_highlight_id: id,
        p_is_published: !currentStatus
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Destaque ${!currentStatus ? 'publicado' : 'despublicado'} com sucesso`
      });

      fetchHighlights();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive"
      });
    }
  };

  const deleteHighlight = async (id: string) => {
    if (!adminUser?.email) return;
    if (!confirm('Tem certeza que deseja excluir este destaque?')) return;

    try {
      const { error } = await supabase.rpc('admin_delete_highlight', {
        p_admin_email: adminUser.email,
        p_highlight_id: id
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Destaque excluído com sucesso"
      });

      fetchHighlights();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o destaque",
        variant: "destructive"
      });
    }
  };

  const getCityDisplayName = (city: string) => {
    const cityMap = cities.find(c => c.value === city);
    return cityMap?.label || city;
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/blog-images/${imageUrl}`;
  };

  const filteredHighlights = highlights.filter(highlight => {
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'published' && highlight.is_published) ||
      (statusFilter === 'draft' && !highlight.is_published);
    
    return matchesStatus;
  });

  if (authLoading || !adminUser) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gerenciar Destaques</h1>
          <p className="text-muted-foreground">Crie e gerencie destaques culturais</p>
        </div>
        <Button asChild className="bg-gradient-primary hover:opacity-90">
          <Link to="/admin/highlights/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Destaque
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as cidades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('');
                setStatusFilter('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHighlights.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Nenhum destaque encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCity || statusFilter
                ? 'Tente ajustar os filtros ou criar um novo destaque.'
                : 'Comece criando seu primeiro destaque.'}
            </p>
            <Button asChild>
              <Link to="/admin/highlights/create">Criar Primeiro Destaque</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHighlights.map((highlight) => (
            <Card key={highlight.id} className="overflow-hidden hover-lift">
              <div className="relative">
                <LazyImage
                  src={getImageUrl(highlight.image_url)}
                  alt={highlight.event_title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={highlight.is_published ? "default" : "secondary"}>
                    {highlight.is_published ? "Publicado" : "Rascunho"}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-background/80">
                    {getCityDisplayName(highlight.city)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-1" title={highlight.event_title}>
                    {highlight.event_title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{highlight.venue}</p>
                </div>
                
                <p className="text-sm line-clamp-2 text-muted-foreground">
                  {highlight.role_text}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {highlight.selection_reasons.slice(0, 2).map((reason, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                  {highlight.selection_reasons.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{highlight.selection_reasons.length - 2}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublishStatus(highlight.id, highlight.is_published)}
                      className="flex items-center gap-1"
                      title={highlight.is_published ? "Despublicar" : "Publicar"}
                    >
                      {highlight.is_published ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button size="sm" variant="outline" asChild>
                      <Link 
                        to={`/admin/highlights/${highlight.id}/edit`}
                        className="flex items-center gap-1"
                        title="Editar"
                      >
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteHighlight(highlight.id)}
                      className="flex items-center gap-1"
                      title="Excluir"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    ❤️ {highlight.like_count}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}