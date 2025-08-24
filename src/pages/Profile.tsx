import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { User, Edit2, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Helmet } from "react-helmet";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      const name = user.profile?.display_name || user.user_metadata?.full_name || '';
      setDisplayName(name);
      setTempDisplayName(name);
    }
  }, [user, authLoading, navigate]);

  const handleSaveDisplayName = async () => {
    if (!tempDisplayName.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: tempDisplayName.trim() })
        .eq('user_id', user?.id);

      if (error) throw error;

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
      <Helmet>
        <title>Meu Perfil – ROLÊ ENTRETENIMENTO</title>
      </Helmet>
      
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
          
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
                        <h2 className="text-3xl font-bold text-foreground">
                          {displayName || 'Usuário'}
                        </h2>
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
                  <p className="text-muted-foreground mb-4">{user.email}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {user.profile?.is_premium && (
                      <Badge variant="default">Premium</Badge>
                    )}
                    {user.profile?.is_admin && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    O email não pode ser alterado
                  </p>
                </div>
                
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
              </div>
              
              <div>
                <Label>Data de Cadastro</Label>
                <p className="text-sm text-muted-foreground">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;