import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Highlight {
  id: string;
  city: string;
  event_title: string;
  venue: string;
  is_published: boolean;
  created_at: string;
}

export default function AdminSimple() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Faça login primeiro');
        return;
      }

      // Em desenvolvimento, permitir qualquer usuário logado
      setHasAccess(true);
      loadHighlights();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro de acesso');
    }
  };

  const loadHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('id, city, event_title, venue, is_published, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHighlights(data || []);
    } catch (error) {
      console.error('Erro ao carregar:', error);
      toast.error('Erro ao carregar destaques');
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('highlights')
        .update({ is_published: !isPublished })
        .eq('id', id);

      if (error) throw error;
      
      setHighlights(highlights.map(h => 
        h.id === id ? { ...h, is_published: !isPublished } : h
      ));
      
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const deleteHighlight = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setHighlights(highlights.filter(h => h.id !== id));
      toast.success('Destaque deletado!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao deletar');
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Verificando acesso...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Destaques</h1>
          <Link to="/admin-simple/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Destaque
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {highlights.map((highlight) => (
            <Card key={highlight.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{highlight.event_title}</h3>
                    <p className="text-muted-foreground">{highlight.venue}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {highlight.city.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(highlight.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublished(highlight.id, highlight.is_published)}
                    >
                      {highlight.is_published ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Link to={`/admin-simple/edit/${highlight.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteHighlight(highlight.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {highlights.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum destaque encontrado</p>
              <Link to="/admin-simple/create" className="mt-4 inline-block">
                <Button>Criar primeiro destaque</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}