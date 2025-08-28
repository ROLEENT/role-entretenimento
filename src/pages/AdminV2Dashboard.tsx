import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useHighlightsAdmin } from '@/hooks/useHighlightsAdmin';
import { AuthStatusIndicator } from '@/components/admin/AuthStatusIndicator';
import { SecurityIndicator } from '@/components/admin/SecurityIndicator';
import { LogOut, Plus, FileText, Eye, Calendar, Building, Users, Mic } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminV2Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useSecureAuth();
  const { highlights, loading } = useHighlightsAdmin();

  const publishedHighlights = highlights.filter(h => h.is_published);
  const draftHighlights = highlights.filter(h => !h.is_published);
  const recentHighlights = highlights
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/admin-v2/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin MVP</h1>
              <p className="text-muted-foreground">Sistema administrativo simplificado</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destaques Publicados</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : publishedHighlights.length}
              </div>
              <p className="text-xs text-muted-foreground">Visíveis no site</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {loading ? '...' : draftHighlights.length}
              </div>
              <p className="text-xs text-muted-foreground">Aguardando publicação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Destaques</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : highlights.length}
              </div>
              <p className="text-xs text-muted-foreground">No sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Security & Auth Status */}
        <div className="mb-8 space-y-4">
          <SecurityIndicator isSecure={true} showDetails={false} />
          <AuthStatusIndicator />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Destaques</CardTitle>
              <CardDescription>
                Os 5 destaques mais recentemente editados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : recentHighlights.length === 0 ? (
                <p className="text-muted-foreground">Nenhum destaque encontrado</p>
              ) : (
                <div className="space-y-3">
                  {recentHighlights.map((highlight) => (
                    <div
                      key={highlight.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin-v2/highlights/edit/${highlight.id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{highlight.event_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {highlight.venue} • {highlight.city}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(highlight.updated_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                      <Badge variant={highlight.is_published ? "default" : "secondary"}>
                        {highlight.is_published ? "Publicado" : "Rascunho"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso direto às funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start" 
                onClick={() => navigate('/admin-v2/highlights/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Destaque
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin-v2/highlights')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerenciar Destaques
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin-v2/events')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Gerenciar Eventos
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin-v2/venues')}
              >
                <Building className="h-4 w-4 mr-2" />
                Gerenciar Locais
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin-v2/artists')}
              >
                <Mic className="h-4 w-4 mr-2" />
                Gerenciar Artistas
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin-v2/organizers')}
              >
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Organizadores
              </Button>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default withAdminAuth(AdminV2Dashboard, 'admin');