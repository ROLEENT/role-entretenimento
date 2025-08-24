import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
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
    <div className="container mx-auto px-4 py-8">
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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            <SelectItem value="são-paulo">São Paulo</SelectItem>
            <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
            <SelectItem value="porto-alegre">Porto Alegre</SelectItem>
            <SelectItem value="florianópolis">Florianópolis</SelectItem>
            <SelectItem value="curitiba">Curitiba</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Highlights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Destaques</CardTitle>
          <CardDescription>
            Gerencie todos os destaques da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Cidade</th>
                    <th className="text-left py-3 px-4">Título</th>
                    <th className="text-left py-3 px-4">Data do Evento</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Likes</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {highlights.map((highlight) => (
                    <tr key={highlight.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{formatCity(highlight.city)}</td>
                      <td className="py-3 px-4 font-medium">{highlight.event_title}</td>
                      <td className="py-3 px-4">{highlight.event_date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          highlight.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {highlight.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{highlight.like_count || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/highlights/${highlight.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={highlight.is_published ? "outline" : "default"}
                            onClick={() => togglePublished(highlight.id, highlight.is_published)}
                          >
                            {highlight.is_published ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteHighlight(highlight.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {highlights.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum destaque encontrado
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHighlightsManagement;