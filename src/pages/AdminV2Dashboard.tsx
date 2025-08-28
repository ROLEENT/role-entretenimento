import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useNavigate } from 'react-router-dom';
import { useSecureAuth } from '@/hooks/useSecureAuth';

import { AuthStatusIndicator } from '@/components/admin/AuthStatusIndicator';
import { SecurityIndicator } from '@/components/admin/SecurityIndicator';
import { LogOut, Plus, FileText, Eye, Calendar, Building, Users, Mic } from 'lucide-react';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminV2Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useSecureAuth();
  // Simplified dashboard - will be populated when highlights system is rebuilt
  const loading = false;
  const publishedHighlights: any[] = [];
  const draftHighlights: any[] = [];
  const recentHighlights: any[] = [];

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
                0
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
              <p className="text-muted-foreground">Sistema de destaques será recriado em breve</p>
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
                disabled
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Destaque (Em breve)
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <FileText className="h-4 w-4 mr-2" />
                Gerenciar Destaques (Em breve)
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Calendar className="h-4 w-4 mr-2" />
                Gerenciar Eventos (Em breve)
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Building className="h-4 w-4 mr-2" />
                Gerenciar Locais (Em breve)
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Mic className="h-4 w-4 mr-2" />
                Gerenciar Artistas (Em breve)
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled
              >
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Organizadores (Em breve)
              </Button>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default withAdminAuth(AdminV2Dashboard, 'admin');