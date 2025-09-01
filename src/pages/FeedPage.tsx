import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Users, Heart, ArrowLeft, TestTube, Star, Ticket, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationSystem from '@/components/NotificationSystem';
import ActivityFeed from '@/components/ActivityFeed';
import { useAuth } from '@/hooks/useAuth';
import SEOHead from '@/components/SEOHead';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useSecureActivityFeed } from '@/hooks/useSecureActivityFeed';
import { useUserEngagement } from '@/hooks/useUserEngagement';

const FeedPage = () => {
  const { user } = useAuth();
  const { activities } = useActivityFeed();
  const { createTestData } = useSecureActivityFeed();
  const { interests, tickets, attendance, likes, loading: engagementLoading } = useUserEngagement();

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
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xl font-bold text-primary">
                            0
                          </div>
                          <div className="text-xs text-muted-foreground">Seguindo</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-primary">
                            0
                          </div>
                          <div className="text-xs text-muted-foreground">Seguidores</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {interests.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Interesses</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-blue-600">
                            {tickets.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Ingressos</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-purple-600">
                            {attendance.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Presença</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-red-600">
                            {likes.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Curtidas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Meu Engajamento */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Meu Engajamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {engagementLoading ? (
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Últimos Interesses */}
                          {interests.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Últimos Interesses</span>
                              </div>
                              <div className="space-y-2">
                                {interests.slice(0, 2).map((interest) => (
                                  <div key={interest.id} className="text-sm">
                                    <Link 
                                      to={`/evento/${interest.events?.id}`}
                                      className="text-primary hover:underline block truncate"
                                    >
                                      {interest.events?.title}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                      {interest.events?.venue?.name} • {interest.events?.city}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Últimas Curtidas */}
                          {likes.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">Últimas Curtidas</span>
                              </div>
                              <div className="space-y-2">
                                {likes.slice(0, 2).map((like) => (
                                  <div key={like.id} className="text-sm">
                                    <Link 
                                      to={`/destaque/${like.highlights?.id}`}
                                      className="text-primary hover:underline block truncate"
                                    >
                                      {like.highlights?.event_title}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                      {like.highlights?.venue} • {like.highlights?.city}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!interests.length && !likes.length && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Comece a interagir com eventos e destaques para ver seu engajamento aqui!
                            </p>
                          )}
                        </div>
                      )}
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
                          Ver Perfil Completo
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/perfil?tab=interesses">
                          <Heart className="h-4 w-4 mr-2" />
                          Meus Interesses
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/perfil?tab=ingressos">
                          <Ticket className="h-4 w-4 mr-2" />
                          Meus Ingressos
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