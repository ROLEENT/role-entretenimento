import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, User as UserIcon, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

const AdminProfile = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({ 
    full_name: 'Admin Role', 
    email: 'admin@role.com.br',
    role: 'Administrador' 
  });

  const handleProfileUpdate = async () => {
    if (!profileForm.full_name || !profileForm.email) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    try {
      setSaving(true);
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input 
                  id="full_name" 
                  value={profileForm.full_name} 
                  onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))} 
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profileForm.email} 
                  onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))} 
                />
              </div>
              <div>
                <Label htmlFor="role">Função</Label>
                <Input 
                  id="role" 
                  value={profileForm.role} 
                  disabled
                  className="bg-muted"
                />
              </div>
              <Button onClick={handleProfileUpdate} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" /> 
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-muted-foreground">ID da Conta</Label>
                  <p className="font-mono text-sm">admin-role-001</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo de Conta</Label>
                  <p className="text-sm">Administrador</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profileForm.email}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="text-sm text-green-600 font-medium">Ativo</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Último acesso</Label>
                  <p className="text-sm">{new Date().toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />
        
        <Card>
          <CardHeader>
            <CardTitle>Permissões de Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Gerenciar Destaques',
                'Gerenciar Parceiros', 
                'Gerenciar Publicidade',
                'Gerenciar Eventos',
                'Gerenciar Posts',
                'Gerenciar Comentários',
                'Gerenciar Contatos',
                'Analytics',
                'Notificações'
              ].map((permission) => (
                <div key={permission} className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{permission}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminProfile;