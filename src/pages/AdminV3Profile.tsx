import React, { useState, useEffect } from 'react';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Loader2, RefreshCw, Trash2, X } from 'lucide-react';

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
  const [originalFullName, setOriginalFullName] = useState('');
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [displayAvatarUrl, setDisplayAvatarUrl] = useState<string | null>(null);

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
        .select('full_name, avatar_url')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const userProfile: UserProfile = {
        id: session.user.id,
        email: session.user.email || '',
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url
      };

      setProfile(userProfile);
      setFullName(userProfile.full_name || '');
      setOriginalFullName(userProfile.full_name || '');
      setOriginalAvatarUrl(userProfile.avatar_url);
      
      // Load avatar signed URL if exists
      if (userProfile.avatar_url) {
        loadAvatarUrl(userProfile.avatar_url);
      }
      
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadAvatarUrl = async (avatarPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 86400); // 24 hours (86400 seconds)

      if (error) {
        console.error('Erro ao carregar signed URL:', error);
        setDisplayAvatarUrl(null);
        return;
      }

      setDisplayAvatarUrl(data.signedUrl);
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
      setDisplayAvatarUrl(null);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo inválido",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
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
      const fileName = `avatars/${profile.id}/avatar_${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (profile.avatar_url) {
        try {
          await supabase.storage
            .from('avatars')
            .remove([profile.avatar_url]);
        } catch (error) {
          console.log('Erro ao remover avatar antigo (continuando):', error);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          upsert: true,
          contentType: avatarFile.type
        });

      if (uploadError) {
        console.error('Upload error message:', uploadError.message);
        throw uploadError;
      }

      return fileName; // Return path, not signed URL
      
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
      let avatarPath = profile.avatar_url;

      // Upload avatar if a new one was selected
      if (avatarFile) {
        avatarPath = await uploadAvatar();
      }

      // Treat empty string as null
      const cleanFullName = fullName.trim() || null;

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: cleanFullName,
          avatar_url: avatarPath
        })
        .eq('user_id', profile.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: cleanFullName,
        avatar_url: avatarPath
      } : null);

      // Update original values
      setOriginalFullName(cleanFullName || '');
      setOriginalAvatarUrl(avatarPath);

      // Clear file state and reload avatar URL
      setAvatarFile(null);
      setAvatarPreview(null);
      
      if (avatarPath) {
        loadAvatarUrl(avatarPath);
      } else {
        setDisplayAvatarUrl(null);
      }

      toast({
        title: "Perfil salvo"
      });
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile || !profile.avatar_url) return;

    setSaving(true);

    try {
      // Remove from storage
      await supabase.storage
        .from('avatars')
        .remove([profile.avatar_url]);

      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', profile.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      setOriginalAvatarUrl(null);
      setDisplayAvatarUrl(null);
      setAvatarFile(null);
      setAvatarPreview(null);

      toast({
        title: "Avatar removido"
      });

    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: "Erro ao remover",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(originalFullName);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const hasChanges = () => {
    return fullName !== originalFullName || avatarFile !== null;
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
        <AdminV3Header />
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-2xl mx-auto">
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
      </AdminV3Guard>
    );
  }

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <AdminV3Breadcrumb 
            items={[
              { label: 'Perfil' }
            ]}
          />
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>

          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-24 h-24 rounded-full" />
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
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage 
                          src={avatarPreview || displayAvatarUrl || undefined}
                          alt={`Avatar de ${profile?.full_name || profile?.email}`}
                        />
                        <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
                          {profile && getUserInitials(profile.email, profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {uploading && (
                        <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="avatar-upload" className="text-sm font-medium">
                          Avatar (96x96)
                        </Label>
                        {avatarFile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Nova imagem selecionada
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/png,image/jpg,image/jpeg,image/webp"
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
                          Escolher arquivo
                        </Button>
                        {(profile?.avatar_url || avatarFile) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            disabled={saving || uploading}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remover
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, JPEG, WebP até 2MB
                      </p>
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      disabled={saving || uploading}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving || uploading || !hasChanges()}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving || uploading || !hasChanges()}
                      className="gap-2"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Salvar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminV3Guard>
  );
}