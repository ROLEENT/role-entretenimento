import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfileImageUpload } from './ProfileImageUpload';
import { useProfiles, type ProfileType, type CreateProfileData, type Profile } from '@/hooks/useProfiles';
import { Loader2, Save } from 'lucide-react';

const profileSchema = z.object({
  handle: z.string()
    .min(3, 'Handle deve ter pelo menos 3 caracteres')
    .max(30, 'Handle deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Handle deve conter apenas letras, números e underscore'),
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  type: z.enum(['artist', 'venue', 'organizer'] as const),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  location: z.string().max(100, 'Localização deve ter no máximo 100 caracteres').optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().max(50, 'Instagram deve ter no máximo 50 caracteres').optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  visibility: z.enum(['public', 'private', 'draft'] as const)
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile?: Profile;
  onSuccess?: (profile: Profile) => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ 
  profile, 
  onSuccess, 
  onCancel 
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [coverUrl, setCoverUrl] = useState<string | null>(profile?.cover_url || null);
  
  const { createProfile, updateProfile, loading } = useProfiles();
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      handle: profile?.handle || '',
      name: profile?.name || '',
      type: profile?.type || 'artist',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      instagram: profile?.instagram || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      visibility: profile?.visibility || 'draft'
    }
  });

  const isEditing = !!profile;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const submitData: CreateProfileData = {
        handle: data.handle,
        name: data.name,
        type: data.type,
        bio: data.bio,
        location: data.location,
        website: data.website,
        instagram: data.instagram,
        email: data.email,
        phone: data.phone,
        visibility: data.visibility,
        metadata: {
          avatar_url: avatarUrl,
          cover_url: coverUrl
        }
      };

      let result: Profile | null;
      
      if (isEditing) {
        result = await updateProfile(profile.id, submitData);
      } else {
        result = await createProfile(submitData);
      }

      if (result && onSuccess) {
        // Update the result with the image URLs
        const updatedResult = {
          ...result,
          avatar_url: avatarUrl,
          cover_url: coverUrl
        };
        onSuccess(updatedResult);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    form.reset();
    setAvatarUrl(profile?.avatar_url || null);
    setCoverUrl(profile?.cover_url || null);
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Editar Perfil' : 'Criar Novo Perfil'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Images */}
            <div className="space-y-6">
              <ProfileImageUpload
                profileId={profile?.id}
                type="avatar"
                currentUrl={avatarUrl}
                onImageChange={setAvatarUrl}
                disabled={loading}
              />
              
              <ProfileImageUpload
                profileId={profile?.id}
                type="cover"
                currentUrl={coverUrl}
                onImageChange={setCoverUrl}
                disabled={loading}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handle *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="meuhandle" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome do perfil" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={loading || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="artist">Artista</SelectItem>
                        <SelectItem value="venue">Local</SelectItem>
                        <SelectItem value="organizer">Organizador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidade</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a visibilidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="public">Público</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte um pouco sobre você..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="São Paulo, SP" 
                      {...field} 
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="contato@exemplo.com" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://meusite.com" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="@meuinstagram" 
                        {...field} 
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Salvar Alterações' : 'Criar Perfil'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};