import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  display_name: string;
  email: string;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Formulário de perfil
  const [profileForm, setProfileForm] = useState<ProfileData>({
    display_name: '',
    email: ''
  });
  
  // Formulário de senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Estados de UI
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Carregamento inicial
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Obter user via supabase.auth.getUser
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) {
        navigate('/admin/login');
        return;
      }

      setUser(user);
      
      // Buscar profiles.display_name filtrando por user_id = user.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Preencher formulário
      setProfileForm({
        display_name: profile?.display_name || '',
        email: user.email || ''
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar nome e e-mail
  const handleProfileUpdate = async () => {
    if (!profileForm.display_name.trim()) {
      toast({
        title: "Erro",
        description: "O nome de exibição é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!profileForm.email.trim()) {
      toast({
        title: "Erro", 
        description: "O e-mail é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      // Atualize profiles.display_name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: profileForm.display_name })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Atualize e-mail com supabase.auth.updateUser
      if (profileForm.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        });

        if (emailError) throw emailError;
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Trocar senha
  const handlePasswordUpdate = async () => {
    // Validar preenchimento
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha",
        variant: "destructive"
      });
      return;
    }

    // Validar confirmação
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    // Validar força de senha
    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      toast({
        title: "Erro",
        description: "A nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      // supabase.auth.updateUser({ password })
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      // Limpar formulário
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso!"
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a senha",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
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
                  placeholder="Digite seu nome de exibição"
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite seu e-mail"
                />
              </div>

              <Button 
                onClick={handleProfileUpdate} 
                disabled={saving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 8 caracteres com letras maiúsculas, minúsculas e números
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handlePasswordUpdate}
                disabled={saving}
                className="w-full"
                variant="outline"
              >
                <Lock className="h-4 w-4 mr-2" />
                {saving ? 'Atualizando...' : 'Atualizar Senha'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">ID da Conta</Label>
                <p className="font-mono text-sm">{user?.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Última atualização</Label>
                <p className="text-sm">{user?.updated_at ? new Date(user.updated_at).toLocaleString('pt-BR') : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminProfile;