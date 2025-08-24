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

const AdminProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, adminUser, loading } = useAdminAuth();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    if (adminUser) {
      setProfileForm({
        full_name: adminUser.full_name || '',
        email: adminUser.email || ''
      });
    }
  }, [isAuthenticated, adminUser, loading, navigate]);

  const handleProfileUpdate = async () => {
    if (!profileForm.full_name || !profileForm.email) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setSaving(true);
      
      console.log('Updating admin profile:', {
        adminId: adminUser?.id,
        fullName: profileForm.full_name,
        email: profileForm.email
      });
      
      const { data, error } = await supabase.rpc('update_admin_profile', {
        p_admin_id: adminUser?.id,
        p_full_name: profileForm.full_name,
        p_email: profileForm.email
      });

      console.log('Update profile result:', { data, error });

      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
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
      
      console.log('Changing admin password for user:', adminUser?.id);
      
      const { data, error } = await supabase.rpc('change_admin_password', {
        p_admin_id: adminUser?.id,
        p_current_password: passwordForm.current_password,
        p_new_password: passwordForm.new_password
      });

      console.log('Change password result:', { data, error });

      if (error) throw error;
      
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      toast.success('Senha alterada com sucesso!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Erro ao alterar senha');
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
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Seu nome completo"
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
              
              <Button onClick={handleProfileUpdate} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
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
              
              <Button onClick={handlePasswordChange} disabled={changingPassword} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                {changingPassword ? 'Alterando...' : 'Alterar Senha'}
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