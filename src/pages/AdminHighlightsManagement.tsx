import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Highlight {
  id: string;
  city: string;
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
  created_at: string;
  updated_at: string;
}

const AdminHighlightsManagement = () => {
  const { user, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
      return;
    }
    
    if (user) {
      fetchHighlights();
    }
  }, [user, authLoading, navigate]);

  const fetchHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
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

  const formatCity = (city: string) => {
    const cities: Record<string, string> = {
      'rio_de_janeiro': 'Rio de Janeiro',
      'sao_paulo': 'São Paulo',
      'porto_alegre': 'Porto Alegre',
      'florianopolis': 'Florianópolis',
      'curitiba': 'Curitiba'
    };
    return cities[city] || city;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestão de Destaques</h1>
          <Button onClick={() => navigate("/admin/highlights/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Destaque
          </Button>
        </div>

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