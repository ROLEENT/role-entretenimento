import { useState } from 'react';
import { Helmet } from "react-helmet";
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, Settings, Heart, Calendar, Crown, Bell, User, Shield, History } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Navigate } from 'react-router-dom';

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emails: true,
    push: false,
    reminders: true,
    newsletter: true
  });
  
  const { user, updateProfile, signOut, isAuthenticated } = useAuth();
  const { favorites } = useFavorites();
  const favoritesLoading = false; // LocalStorage favorites don't have loading state

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const displayName = formData.get('displayName') as string;

    const { error } = await updateProfile({
      display_name: displayName
    });

    if (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar perfil.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
    }

    setLoading(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    toast({
      title: "Preferências atualizadas",
      description: "Suas configurações de notificação foram salvas."
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Meu Perfil – ROLÊ ENTRETENIMENTO | Dashboard do Usuário</title>
        <meta 
          name="description" 
          content="Gerencie seus eventos favoritos, configurações de conta e preferências de notificação no seu dashboard pessoal do ROLÊ." 
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://roleentretenimento.com/perfil" />
      </Helmet>

      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profile?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {user?.profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {user?.profile?.display_name || 'Usuário'}
                  </h1>
                  {user?.profile?.is_premium && (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{user?.email}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{favorites.length} eventos favoritos</Badge>
                  <Badge variant="outline">Membro desde 2024</Badge>
                </div>
              </div>
              
              <Button onClick={handleSignOut} variant="outline">
                Sair da conta
              </Button>
            </div>

            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Favoritos</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Conta</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notificações</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Calendário</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Seus Eventos Favoritos ({favorites.length})
                    </CardTitle>
                    <CardDescription>
                      Eventos que você marcou como favoritos e quer acompanhar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {favoritesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : favorites.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum evento favorito ainda</h3>
                        <p className="text-muted-foreground mb-6">
                          Explore nossa agenda e marque eventos como favoritos para acompanhar facilmente
                        </p>
                        <Button asChild>
                          <a href="/eventos">Explorar Eventos</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {favorites.map((event) => (
                           <EventCard
                             key={event.id}
                             event={{
                               id: event.id,
                               title: event.title,
                               category: event.category || 'Evento',
                               city: event.city,
                               date: event.date,
                               image: event.image,
                               price: 0,
                               description: ''
                             }}
                           />
                         ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Histórico de Participações
                    </CardTitle>
                    <CardDescription>
                      Eventos que você participou ou manifestou interesse
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Funcionalidade em desenvolvimento</h3>
                      <p className="text-muted-foreground">
                        Em breve você poderá ver seu histórico completo de eventos e participações
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Account Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Configurações da Conta
                    </CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais e preferências
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Nome de Exibição</Label>
                          <Input
                            id="displayName"
                            name="displayName"
                            defaultValue={user?.profile?.display_name || ''}
                            placeholder="Seu nome completo"
                            disabled={loading}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            O email não pode ser alterado por questões de segurança
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                          <h4 className="font-medium">Alterar senha</h4>
                          <p className="text-sm text-muted-foreground">
                            Para alterar sua senha, clique no botão ao lado
                          </p>
                        </div>
                        <Button variant="outline" type="button">
                          Alterar Senha
                        </Button>
                      </div>
                      
                      <Button type="submit" disabled={loading} className="w-full md:w-auto">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Preferências de Notificação
                    </CardTitle>
                    <CardDescription>
                      Configure como e quando quer receber notificações sobre eventos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificações por email</h4>
                          <p className="text-sm text-muted-foreground">
                            Receber emails sobre novos eventos e atualizações
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.emails}
                          onCheckedChange={(checked) => handleNotificationChange('emails', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notificações push</h4>
                          <p className="text-sm text-muted-foreground">
                            Receber notificações diretas no navegador
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Lembretes de eventos</h4>
                          <p className="text-sm text-muted-foreground">
                            Receber lembretes dos seus eventos favoritos
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.reminders}
                          onCheckedChange={(checked) => handleNotificationChange('reminders', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Newsletter semanal</h4>
                          <p className="text-sm text-muted-foreground">
                            Receber nossa curadoria semanal de destaques
                          </p>
                        </div>
                        <Switch
                          checked={notificationSettings.newsletter}
                          onCheckedChange={(checked) => handleNotificationChange('newsletter', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Calendar Tab */}
              <TabsContent value="calendar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Calendário Pessoal
                    </CardTitle>
                    <CardDescription>
                      Visualize seus eventos favoritos em formato de calendário
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Calendário interativo em desenvolvimento</h3>
                      <p className="text-muted-foreground mb-6">
                        Em breve você poderá visualizar seus eventos favoritos em formato de calendário 
                        e exportar para Google Calendar, Outlook e outros aplicativos
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Badge variant="outline">Google Calendar</Badge>
                        <Badge variant="outline">Outlook</Badge>
                        <Badge variant="outline">Apple Calendar</Badge>
                        <Badge variant="outline">Export ICS</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;