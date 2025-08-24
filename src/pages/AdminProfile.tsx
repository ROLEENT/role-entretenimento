import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { EnvironmentBanner } from '@/components/EnvironmentBanner';
import { useSimulationMode } from '@/hooks/useSimulationMode';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, adminUser, loading } = useAdminAuth();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { isSimulating, simulateOperation, isReadOnlyError } = useSimulationMode();

  const [profileForm, setProfileForm] = useState({
    display_name: '',
    email: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (adminUser?.id) {
      loadProfileData();
      setProfileForm(prev => ({
        ...prev,
        email: adminUser.email || ''
      }));
    }
  }, [isAuthenticated, adminUser, loading, navigate]);

  const loadProfileData = async () => {
    if (!adminUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', adminUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setProfileForm(prev => ({
        ...prev,
        display_name: data?.display_name || adminUser.full_name || ''
      }));
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileForm.display_name || !profileForm.email) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (!adminUser?.id) {
      toast.error('Usuário não identificado');
      return;
    }

    try {
      setSaving(true);

      // Atualizar display_name na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: adminUser.id,
          display_name: profileForm.display_name
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        if (isReadOnlyError(profileError)) {
          simulateOperation("Atualização de perfil", "administrador");
          return;
        }
        throw profileError;
      }

      // Se o email mudou, atualizar via Supabase Auth
      if (profileForm.email !== adminUser.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: profileForm.email
        });

        if (authError) {
          if (isReadOnlyError(authError)) {
            simulateOperation("Atualização de email", "administrador");
            return;
          }
          throw authError;
        }

        toast.success('Perfil atualizado! Verifique seu novo email para confirmar a alteração.');
      } else {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      if (isReadOnlyError(error)) {
        simulateOperation("Atualização de perfil", "administrador");
      } else {
        toast.error(error.message || 'Erro ao atualizar perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setChangingPassword(true);

      // Tentar fazer login com a senha atual para validar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminUser?.email || '',
        password: passwordForm.current_password
      });

      if (signInError) {
        toast.error('Senha atual incorreta');
        return;
      }

      // Atualizar senha via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.new_password
      });

      if (updateError) {
        if (isReadOnlyError(updateError)) {
          simulateOperation("Alteração de senha", "administrador", () => {
            setPasswordForm({
              current_password: '',
              new_password: '',
              confirm_password: ''
            });
          });
          return;
        }
        throw updateError;
      }

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      toast.success('Senha alterada com sucesso!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      if (isReadOnlyError(error)) {
        simulateOperation("Alteração de senha", "administrador", () => {
          setPasswordForm({
            current_password: '',
            new_password: '',
            confirm_password: ''
          });
        });
      } else {
        toast.error(error.message || 'Erro ao alterar senha');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
            </div>
          </div>
          
          <EnvironmentBanner className="mb-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="display_name">Nome de Exibição</Label>
                <Input
                  id="display_name"
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Seu nome de exibição"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Seu email"
                />
              </div>
              
              <Button onClick={handleProfileUpdate} disabled={saving || isSimulating} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSimulating ? 'Simulando...' : saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current_password">Senha Atual</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div>
                <Label htmlFor="new_password">Nova Senha</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div>
                <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  placeholder="Confirme a nova senha"
                />
              </div>
              
              <Button onClick={handlePasswordChange} disabled={changingPassword || isSimulating} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                {isSimulating ? 'Simulando...' : changingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">ID da Conta</Label>
                <p className="font-mono text-sm">{adminUser?.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tipo de Conta</Label>
                <p className="text-sm">Administrador</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-sm">{adminUser?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="text-sm text-green-600">Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminProfile;