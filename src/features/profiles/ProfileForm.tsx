import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, User, MapPin, Building } from 'lucide-react';
import { createProfile, checkHandleAvailability } from './services';
import { validateImageFile, validateImageDimensions } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export default function ProfileForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handleValidation, setHandleValidation] = useState<{ checking: boolean; available?: boolean }>({ checking: false });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      type: 'artista',
      visibility: 'public',
      country: 'BR',
      name: '',
      handle: '',
      city: '',
      state: '',
      bio_short: '',
      bio: '',
      capacity: 0,
      age_policy: ''
    }
  });

  const watchedType = form.watch('type');

  const handleHandleBlur = async (value: string) => {
    if (!value || value.length < 3) return;
    
    setHandleValidation({ checking: true });
    try {
      const available = await checkHandleAvailability(value);
      setHandleValidation({ checking: false, available });
      
      if (!available) {
        form.setError('handle', { message: 'Este handle já está em uso' });
      } else {
        form.clearErrors('handle');
      }
    } catch (error) {
      setHandleValidation({ checking: false });
      console.error('Error checking handle:', error);
    }
  };

  const handleFileChange = async (file: File, type: 'avatar' | 'cover') => {
    const validationError = validateImageFile(file, type);
    if (validationError) {
      toast({ variant: 'destructive', description: validationError });
      return;
    }

    const dimensionError = await validateImageDimensions(file, type);
    if (dimensionError) {
      toast({ variant: 'destructive', description: dimensionError });
      return;
    }

    const preview = URL.createObjectURL(file);
    
    if (type === 'avatar') {
      setAvatarPreview(preview);
      setAvatarFile(file);
    } else {
      setCoverPreview(preview);
      setCoverFile(file);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const profileData = {
        ...data,
        avatar_file: avatarFile,
        cover_file: coverFile
      };
      
      const profileId = await createProfile(profileData);
      toast({ description: 'Perfil criado com sucesso!' });
      navigate(`/perfil/${data.handle}`);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({ 
        variant: 'destructive', 
        description: 'Erro ao criar perfil: ' + (error.message || 'Erro desconhecido') 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Criar Perfil</h1>
          <p className="text-muted-foreground">Crie seu perfil público na plataforma</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipo de Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => form.setValue('type', value)} defaultValue="artista">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artista">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Artista/DJ
                  </div>
                </SelectItem>
                <SelectItem value="local">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Local/Venue
                  </div>
                </SelectItem>
                <SelectItem value="organizador">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Organizador
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Público *</Label>
                <Input
                  id="name"
                  {...form.register('name', { required: 'Nome é obrigatório' })}
                  placeholder={watchedType === 'artista' ? 'Nome artístico' : 'Nome do local/organizador'}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{String(form.formState.errors.name.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="handle">Handle (@) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                  <Input
                    id="handle"
                    {...form.register('handle', { required: 'Handle é obrigatório' })}
                    className="pl-8"
                    placeholder="seuhandle"
                    onBlur={(e) => handleHandleBlur(e.target.value)}
                  />
                  {handleValidation.checking && (
                    <div className="absolute right-3 top-2.5">
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                    </div>
                  )}
                </div>
                {form.formState.errors.handle && (
                  <p className="text-sm text-destructive">{String(form.formState.errors.handle.message)}</p>
                )}
                {handleValidation.available === true && (
                  <p className="text-sm text-green-600">Handle disponível ✓</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Input 
                  id="city" 
                  {...form.register('city', { required: 'Cidade é obrigatória' })} 
                  placeholder="São Paulo" 
                />
              </div>
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input 
                  id="state" 
                  {...form.register('state', { required: 'Estado é obrigatório' })} 
                  placeholder="SP" 
                />
              </div>
              <div>
                <Label htmlFor="country">País *</Label>
                <Input id="country" {...form.register('country')} placeholder="BR" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio_short">Bio Curta (até 160 caracteres) *</Label>
              <Textarea
                id="bio_short"
                {...form.register('bio_short', { required: 'Bio curta é obrigatória' })}
                placeholder="Descreva brevemente seu trabalho..."
                maxLength={160}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {watchedType === 'local' && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacidade *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...form.register('capacity', { required: 'Capacidade é obrigatória', valueAsNumber: true })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="age_policy">Política de Idade *</Label>
                  <Input
                    id="age_policy"
                    {...form.register('age_policy', { required: 'Política de idade é obrigatória' })}
                    placeholder="18+, 16+, livre"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || handleValidation.available === false}>
            {isSubmitting ? 'Criando...' : 'Criar Perfil'}
          </Button>
        </div>
      </form>
    </div>
  );
}