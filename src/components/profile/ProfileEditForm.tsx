import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpdateUserProfile, useValidateUsername, UserProfile } from '@/hooks/useUserProfile';
import { useDebounce } from 'use-debounce';
import { Check, X, Info } from 'lucide-react';

const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30, 'Username deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username pode conter apenas letras, números e underscore'),
  display_name: z.string().max(100, 'Nome muito longo').optional(),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio muito longa').optional(),
  city_preferences: z.array(z.string()).optional(),
  genre_preferences: z.array(z.string()).optional(),
  accessibility_notes: z.string().max(1000, 'Notas muito longas').optional(),
  is_profile_public: z.boolean().default(true),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile?: UserProfile | null;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const updateProfile = useUpdateUserProfile();
  const validateUsername = useValidateUsername();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      display_name: profile?.display_name || '',
      avatar_url: profile?.avatar_url || '',
      bio: profile?.bio || '',
      city_preferences: profile?.city_preferences || [],
      genre_preferences: profile?.genre_preferences || [],
      accessibility_notes: profile?.accessibility_notes || '',
      is_profile_public: profile?.is_profile_public ?? true,
    },
  });

  const watchedUsername = form.watch('username');
  const [debouncedUsername] = useDebounce(watchedUsername, 500);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername !== profile?.username && debouncedUsername.length >= 3) {
      setUsernameStatus('checking');
      validateUsername.mutate(debouncedUsername, {
        onSuccess: (isAvailable) => {
          setUsernameStatus(isAvailable ? 'available' : 'taken');
        },
        onError: () => {
          setUsernameStatus(null);
        },
      });
    } else if (debouncedUsername === profile?.username) {
      setUsernameStatus('available');
    } else {
      setUsernameStatus(null);
    }
  }, [debouncedUsername, profile?.username, validateUsername]);

  const onSubmit = async (data: ProfileFormData) => {
    if (usernameStatus === 'taken') {
      form.setError('username', { message: 'Este username já está em uso' });
      return;
    }

    updateProfile.mutate(data);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
        <CardDescription>
          Atualize suas informações e preferências do Rolezeiro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={form.watch('avatar_url') || ''} />
                <AvatarFallback className="text-lg">
                  {getInitials(form.watch('display_name') || form.watch('username') || 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{form.watch('display_name') || form.watch('username')}</p>
                <p className="text-sm text-muted-foreground">@{form.watch('username')}</p>
              </div>
            </div>

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="seu_username" {...field} />
                      {usernameStatus === 'checking' && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      )}
                      {usernameStatus === 'available' && field.value && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      {usernameStatus === 'taken' && (
                        <X className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Seu identificador único no Rolezeiro. Apenas letras, números e underscore.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name */}
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome para Exibição</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Como você quer ser chamado no site
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar URL */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Avatar</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/sua-foto.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link para sua foto de perfil
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conte um pouco sobre você e seus gostos musicais..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo de 500 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Accessibility Notes */}
            <FormField
              control={form.control}
              name="accessibility_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Acessibilidade</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva suas necessidades de acessibilidade para eventos..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ajude organizadores a tornar eventos mais acessíveis para você
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Visibility */}
            <FormField
              control={form.control}
              name="is_profile_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Perfil Público
                    </FormLabel>
                    <FormDescription>
                      Permitir que outros usuários vejam seu perfil e atividades
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Privacy Notice */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacidade:</strong> Mesmo com perfil público, você pode controlar 
                individualmente a visibilidade de suas presenças em eventos através da opção 
                "Mostrar publicamente" em cada evento.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateProfile.isPending || usernameStatus === 'taken'}
              >
                {updateProfile.isPending ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}