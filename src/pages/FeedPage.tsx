import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Users, Heart, ArrowLeft, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationSystem from '@/components/NotificationSystem';
import ActivityFeed from '@/components/ActivityFeed';
import { useAuth } from '@/hooks/useAuth';
import SEOHead from '@/components/SEOHead';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useSecureActivityFeed } from '@/hooks/useSecureActivityFeed';

const FeedPage = () => {
  const { user } = useAuth();
  const { activities } = useActivityFeed();
  const { createTestData } = useSecureActivityFeed();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você precisa estar logado para ver seu feed de atividades.
            </p>
            <Button asChild>
              <Link to="/auth">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Feed de Atividades - Rolê"
        description="Acompanhe as atividades dos perfis que você segue e suas notificações no Rolê"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Seu Feed
              </h1>
              <p className="text-muted-foreground">
                Acompanhe atividades e notificações
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Feed de Atividades
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ActivityFeed />
                </div>
                
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Estatísticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-primary">
                            {user.profile?.following_count || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Seguindo</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-primary">
                            {user.profile?.followers_count || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Seguidores</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {activities.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Atividades</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        Ações Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/eventos">
                          <Calendar className="h-4 w-4 mr-2" />
                          Buscar Eventos
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/perfil">
                          <Users className="h-4 w-4 mr-2" />
                          Editar Perfil
                        </Link>
                      </Button>
                      {process.env.NODE_ENV === 'development' && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-amber-600 border-amber-200"
                          onClick={createTestData}
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Dados de Teste
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Central de Notificações
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Gerencie todas as suas notificações em um só lugar
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-96">
                      <NotificationSystem />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default FeedPage;