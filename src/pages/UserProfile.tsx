import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Settings, Heart, Calendar, Crown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import { Navigate } from 'react-router-dom';

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user, updateProfile, signOut, isAuthenticated } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();

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

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.profile?.avatar_url} />
              <AvatarFallback className="text-lg">
                {user?.profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">
                  {user?.profile?.display_name || 'Usuário'}
                </h1>
                {user?.profile?.is_premium && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            
            <Button onClick={handleSignOut} variant="outline">
              Sair
            </Button>
          </div>

          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="w-4 h-4" />
                Calendário
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Seus Eventos Favoritos ({favorites.length})
                  </CardTitle>
                  <CardDescription>
                    Eventos que você marcou como favoritos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {favoritesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Você ainda não tem eventos favoritos
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map((event) => (
                        <EventCard
                          key={event.id}
                          event={{
                            id: event.id,
                            title: event.title,
                            category: event.categories?.[0]?.category?.name || 'Evento',
                            city: event.city,
                            date: event.date_start,
                            image: event.image_url,
                            price: event.price_min || 0,
                            description: event.description
                          }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Perfil</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nome de Exibição</Label>
                      <Input
                        id="displayName"
                        name="displayName"
                        defaultValue={user?.profile?.display_name || ''}
                        placeholder="Seu nome"
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
                        O email não pode ser alterado
                      </p>
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Alterações
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
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
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Calendário interativo em desenvolvimento
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Em breve você poderá visualizar seus eventos favoritos
                      em formato de calendário e exportar para Google Calendar
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;