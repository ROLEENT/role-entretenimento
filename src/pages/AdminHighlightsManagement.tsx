import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Heart } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CityEnum = 'porto_alegre' | 'sao_paulo' | 'rio_de_janeiro' | 'florianopolis' | 'curitiba';

interface Highlight {
  id: string;
  city: CityEnum;
  event_title: string;
  venue: string;
  ticket_url?: string;
  event_date: string;
  role_text: string;
  selection_reasons: string[];
  image_url?: string;
  photo_credit?: string;
  sort_order: number;
  is_published: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

const AdminHighlightsManagement = () => {
  const { adminUser, loading: authLoading, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState<string | "all">("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin/login");
      return;
    }
    
    if (isAuthenticated) {
      fetchHighlights();
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Refetch when filters change
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchHighlights();
    }
  }, [searchTerm, cityFilter]);

  const fetchHighlights = async () => {
    try {
      let query = supabase
        .from('highlights')
        .select('*');

      // Apply city filter
      if (cityFilter !== "all") {
        query = query.eq('city', cityFilter as CityEnum);
      }

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike('event_title', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query
        .order('sort_order', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error('Erro ao carregar destaques:', error);
      toast.error('Erro ao carregar destaques');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('highlights')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setHighlights(prev => 
        prev.map(h => h.id === id ? { ...h, is_published: !currentStatus } : h)
      );
      
      toast.success(`Destaque ${!currentStatus ? 'publicado' : 'despublicado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do destaque');
    }
  };

  const deleteHighlight = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este destaque?')) return;

    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHighlights(prev => prev.filter(h => h.id !== id));
      toast.success('Destaque excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir destaque:', error);
      toast.error('Erro ao excluir destaque');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatCity = (city: CityEnum) => {
    const cities: Record<CityEnum, string> = {
      'porto_alegre': 'Porto Alegre',
      'sao_paulo': 'São Paulo',
      'rio_de_janeiro': 'Rio de Janeiro',
      'florianopolis': 'Florianópolis',
      'curitiba': 'Curitiba'
    };
    return cities[city] || city;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Destaques</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gerenciar Destaques</h1>
          <Button onClick={() => navigate("/admin/highlights/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Destaque
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título do evento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    <SelectItem value="porto_alegre">Porto Alegre</SelectItem>
                    <SelectItem value="florianopolis">Florianópolis</SelectItem>
                    <SelectItem value="curitiba">Curitiba</SelectItem>
                    <SelectItem value="sao_paulo">São Paulo</SelectItem>
                    <SelectItem value="rio_de_janeiro">Rio de Janeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {highlights.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhum destaque encontrado</p>
              <Button onClick={() => navigate("/admin/highlights/create")}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Destaque
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {highlights.map((highlight) => (
              <Card key={highlight.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{highlight.event_title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatCity(highlight.city)}</span>
                        <span>•</span>
                        <span>{highlight.venue}</span>
                        <span>•</span>
                        <span>{new Date(highlight.event_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={highlight.is_published ? "default" : "secondary"}>
                        {highlight.is_published ? "Publicado" : "Rascunho"}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        <span>{highlight.like_count || 0}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Ordem: {highlight.sort_order}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {highlight.image_url && (
                      <div className="md:col-span-1">
                        <img
                          src={highlight.image_url.startsWith('http') 
                            ? highlight.image_url 
                            : `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${highlight.image_url}`
                          }
                          alt={highlight.event_title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {highlight.photo_credit && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {highlight.photo_credit}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className={highlight.image_url ? "md:col-span-2" : "md:col-span-3"}>
                      <p className="text-sm mb-3 leading-relaxed">
                        {highlight.role_text}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {highlight.selection_reasons.map((reason, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                      
                      {highlight.ticket_url && (
                        <a 
                          href={highlight.ticket_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Link do ingresso →
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(highlight.id, highlight.is_published)}
                    >
                      {highlight.is_published ? (
                        <EyeOff className="w-4 h-4 mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      {highlight.is_published ? 'Despublicar' : 'Publicar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/highlights/edit/${highlight.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteHighlight(highlight.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminHighlightsManagement;