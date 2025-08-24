import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import EventCard from '@/components/EventCard';
import { Calendar, Heart, Settings, Bell, User, LogOut, Clock, CalendarDays, Edit2, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, signOut, updateProfile, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [eventReminders, setEventReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      const name = user.profile?.display_name || user.user_metadata?.full_name || '';
      setDisplayName(name);
      setTempDisplayName(name);
      setEmail(user.email || '');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const handleSaveDisplayName = async () => {
    if (!tempDisplayName.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        display_name: tempDisplayName.trim()
      });
      setDisplayName(tempDisplayName.trim());
      setIsEditingName(false);
      toast.success('Nome atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      toast.error('Erro ao atualizar nome');
      setTempDisplayName(displayName); // Revert changes
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditName = () => {
    setTempDisplayName(displayName);
    setIsEditingName(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      toast.success('Senha alterada com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    switch (type) {
      case 'email':
        setEmailNotifications(value);
        break;
      case 'push':
        setPushNotifications(value);
        break;
      case 'reminders':
        setEventReminders(value);
        break;
      case 'digest':
        setWeeklyDigest(value);
        break;
    }
    toast.success('Configuração atualizada!');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {displayName?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={tempDisplayName}
                          onChange={(e) => setTempDisplayName(e.target.value)}
                          className="text-2xl font-bold"
                          placeholder="Digite seu nome"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveDisplayName}
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditName}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-foreground">
                          {displayName || 'Usuário'}
                        </h1>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingName(true)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{email}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      <Heart className="h-3 w-3 mr-1" />
                      {favorites.length} favoritos
                    </Badge>
                    {user.profile?.is_premium && (
                      <Badge variant="default">Premium</Badge>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="favorites" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Conta
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Calendário
              </TabsTrigger>
            </TabsList>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Meus Eventos Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favoritesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Carregando favoritos...</p>
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum favorito ainda</h3>
                      <p className="text-muted-foreground mb-4">
                        Explore eventos e adicione seus favoritos clicando no ❤️
                      </p>
                      <Button onClick={() => navigate('/eventos')}>
                        Explorar Eventos
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favorites.map((event) => (
                        <EventCard
                          key={event.id}
                          event={{
                            ...event,
                            price: event.price || 0,
                            description: event.description || ''
                          }}
                          className="h-fit"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Histórico de Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Funcionalidade em desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Em breve você poderá ver o histórico dos eventos que participou
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Configurações da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="displayName">Nome de Exibição</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="displayName"
                            value={displayName}
                            disabled
                            className="bg-muted"
                            placeholder="Como você quer ser chamado"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingName(true)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use o botão de editar para alterar seu nome
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          O email não pode ser alterado
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Alterar Senha</h4>
                      
                      <div>
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repita a nova senha"
                        />
                      </div>
                      
                      <Button 
                        onClick={handlePasswordChange}
                        disabled={loading || !newPassword || newPassword !== confirmPassword}
                        variant="outline"
                        className="w-full"
                      >
                        {loading ? 'Alterando...' : 'Alterar Senha'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Configurações de Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações por Email</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber atualizações sobre novos eventos
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações Push</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações no navegador
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Lembretes de Eventos</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber lembretes de eventos favoritos
                      </p>
                    </div>
                    <Switch
                      checked={eventReminders}
                      onCheckedChange={(checked) => handleNotificationChange('reminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Resumo Semanal</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber resumo dos melhores eventos da semana
                      </p>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={(checked) => handleNotificationChange('digest', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendário Pessoal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Em desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Em breve você poderá visualizar seus eventos em calendário
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