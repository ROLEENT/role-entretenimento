import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Plus, Eye, LogOut, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Highlight {
  id: string;
  event_title: string;
  city: string;
  venue: string;
  is_published: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const AUTHORIZED_EMAILS = [
    'pablohenrique.dev@gmail.com',
    'admin@role.app'
  ];

  useEffect(() => {
    checkAuth();
    loadHighlights();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email || !AUTHORIZED_EMAILS.includes(session.user.email)) {
      navigate('/admin/login');
      return;
    }
    
    setUser(session.user);
  };

  const loadHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('id, event_title, city, venue, is_published, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHighlights(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar destaques');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('highlights')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setHighlights(prev => 
        prev.map(h => 
          h.id === id ? { ...h, is_published: !currentStatus } : h
        )
      );

      toast.success(
        !currentStatus ? 'Destaque publicado!' : 'Destaque despublicado!'
      );
    } catch (error: any) {
      toast.error('Erro ao atualizar destaque');
    }
  };

  const deleteHighlight = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este destaque?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHighlights(prev => prev.filter(h => h.id !== id));
      toast.success('Destaque excluído!');
    } catch (error: any) {
      toast.error('Erro ao excluir destaque');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin - Role</h1>
            <p className="text-sm text-muted-foreground">
              Gestão de Destaques | {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin/highlights/create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Destaque
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Destaques</h2>
          <p className="text-muted-foreground">
            {highlights.length} destaque(s) encontrado(s)
          </p>
        </div>

        {highlights.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum destaque encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro destaque.
              </p>
              <Button
                onClick={() => navigate('/admin/highlights/create')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeiro Destaque
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {highlights.map((highlight) => (
              <Card key={highlight.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">
                          {highlight.event_title}
                        </h3>
                        <Badge 
                          variant={highlight.is_published ? "default" : "secondary"}
                        >
                          {highlight.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="capitalize">{highlight.city}</span>
                        {highlight.venue && ` • ${highlight.venue}`}
                        <span className="ml-2">
                          {new Date(highlight.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePublished(highlight.id, highlight.is_published)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {highlight.is_published ? 'Despublicar' : 'Publicar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/highlights/${highlight.id}/edit`)}
                        className="gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteHighlight(highlight.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;