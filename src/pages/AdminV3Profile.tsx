import React, { useState, useEffect } from 'react';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Upload, Save, Loader2, RefreshCw } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function AdminV3Profile() {
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Sessão não encontrada');
      }

      // Fetch user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, avatar_url, role')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const userProfile: UserProfile = {
        id: session.user.id,
        email: session.user.email || profileData.email || '',
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url
      };

      setProfile(userProfile);
      setFullName(userProfile.full_name || '');
      
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro", 
        description: "A imagem deve ter menos de 5MB",
        variant: "destructive"
      });
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !profile) return null;

    setUploading(true);
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `avatars/${profile.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('avatars')
          .remove([oldPath]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
      
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    
    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if a new one was selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl
        })
        .eq('user_id', profile.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl
      } : null);

      // Clear file state
      setAvatarFile(null);
      setAvatarPreview(null);

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso"
      });
      
      setPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar senha",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Sucesso",
        description: "Todas as sessões foram revogadas. Você será redirecionado para o login."
      });
      
    } catch (error) {
      console.error('Erro ao revogar sessões:', error);
      toast({
        title: "Erro",
        description: "Erro ao revogar sessões",
        variant: "destructive"
      });
    }
  };

  const getUserInitials = (email: string, fullName?: string | null) => {
    if (fullName) {
      const names = fullName.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : fullName[0].toUpperCase();
    }
    return email[0].toUpperCase();
  };

  if (error) {
    return (
      <AdminV3Guard>
        <div className="min-h-screen bg-background">
          <AdminV3Header />
          <div className="pt-16 p-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-destructive mb-4">
                    <p className="font-semibold">Erro ao carregar perfil</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                  <Button onClick={loadProfile} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Tentar de novo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminV3Guard>
    );
  }

  return (
    <AdminV3Guard>
      <div className="min-h-screen bg-background">
        <AdminV3Header />
        <div className="pt-16 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações de segurança</p>
            </div>

            {/* Account Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-20 h-20 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-48 h-4" />
                      </div>
                    </div>
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                  </div>
                ) : (
                  <>
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-20 h-20">
                          <AvatarImage 
                            src={avatarPreview || profile?.avatar_url || undefined} 
                            alt="Avatar"
                          />
                          <AvatarFallback className="text-lg">
                            {profile && getUserInitials(profile.email, profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        {uploading && (
                          <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Label htmlFor="avatar-upload" className="text-sm font-medium">
                            Foto do perfil
                          </Label>
                          {avatarFile && (
                            <span className="text-xs text-muted-foreground">
                              (Nova imagem selecionada)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            disabled={saving || uploading}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('avatar-upload')?.click()}
                            disabled={saving || uploading}
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Alterar foto
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF até 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        O e-mail não pode ser alterado
                      </p>
                    </div>

                    {/* Full Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome completo</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Digite seu nome completo"
                        disabled={saving}
                      />
                    </div>

                    {/* Save Button */}
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving || uploading}
                      className="gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar alterações
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full h-10" />
                    <Skeleton className="w-full h-10" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Senha</h4>
                        <p className="text-sm text-muted-foreground">
                          Altere sua senha regularmente para manter sua conta segura
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setPasswordModalOpen(true)}
                        disabled={saving}
                      >
                        Alterar senha
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sessões</h4>
                        <p className="text-sm text-muted-foreground">
                          Revogue todas as sessões ativas em todos os dispositivos
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleRevokeAllSessions}
                        disabled={saving}
                      >
                        Revogar sessões
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha desejada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPasswordModal">Senha atual</Label>
              <Input
                id="currentPasswordModal"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  currentPassword: e.target.value 
                }))}
                disabled={passwordLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPasswordModal">Nova senha</Label>
              <Input
                id="newPasswordModal"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  newPassword: e.target.value 
                }))}
                disabled={passwordLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPasswordModal">Confirmar nova senha</Label>
              <Input
                id="confirmPasswordModal"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  confirmPassword: e.target.value 
                }))}
                disabled={passwordLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPasswordModalOpen(false)}
              disabled={passwordLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Alterando...
                </>
              ) : (
                'Alterar senha'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminV3Guard>
  );
}