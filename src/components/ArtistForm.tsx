import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const ARTIST_TYPES = [
  { value: 'artist', label: 'Artista' },
  { value: 'band', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'collective', label: 'Coletivo' },
  { value: 'producer', label: 'Produtor' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' }
];

const CITIES = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 
  'Porto Alegre', 'Curitiba', 'Florianópolis', 'Salvador',
  'Recife', 'Fortaleza', 'Goiânia', 'Manaus'
];

const artistSchema = z.object({
  stage_name: z.string().min(1, 'Nome artístico é obrigatório').max(100, 'Máximo 100 caracteres'),
  slug: z.string().min(1, 'Slug é obrigatório').max(100, 'Máximo 100 caracteres'),
  artist_type: z.enum(['artist', 'band', 'dj', 'collective', 'producer'], {
    required_error: 'Tipo é obrigatório'
  }),
  status: z.enum(['active', 'inactive']).default('active'),
  city: z.string().optional(),
  instagram: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      // Aceita @usuario ou URL completa do Instagram
      return /^@[a-zA-Z0-9._]+$/.test(val) || /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/.test(val);
    }, 'Formato inválido. Use @usuario ou URL completa do Instagram'),
  // Campos obrigatórios que vamos preencher com padrões
  booking_email: z.string().email('Email inválido'),
  booking_whatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  bio_short: z.string().min(1, 'Bio curta é obrigatória'),
  profile_image_url: z.string().url('URL da imagem inválida')
});

type ArtistFormData = z.infer<typeof artistSchema>;

interface Artist {
  id: string;
  stage_name: string;
  slug: string;
  artist_type: string;
  status: string;
  city?: string;
  instagram?: string;
  booking_email: string;
  booking_whatsapp: string;
  bio_short: string;
  profile_image_url: string;
}

interface ArtistFormProps {
  initialData?: Artist | null;
  mode: 'create' | 'edit';
}

// Slug checker component
const SlugChecker = ({ value, onChange, stageName }: { 
  value: string; 
  onChange: (value: string) => void;
  stageName: string;
}) => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestion, setSuggestion] = useState<string>('');
  const [checking, setChecking] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const checkSlug = useCallback(async (slug: string) => {
    if (!slug || slug.length < 2) {
      setStatus('idle');
      return;
    }

    try {
      setChecking(true);
      setStatus('checking');
      
      const response = await fetch(`/api/agenda/slug-exists?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      if (data.exists) {
        setStatus('taken');
        setSuggestion(data.suggestion || '');
      } else {
        setStatus('available');
        setSuggestion('');
      }
    } catch (error) {
      console.error('Erro ao verificar slug:', error);
      setStatus('idle');
    } finally {
      setChecking(false);
    }
  }, []);

  // Debounced slug checking
  useEffect(() => {
    if (value && value.length >= 2) {
      const timeoutId = setTimeout(() => checkSlug(value), 500);
      return () => clearTimeout(timeoutId);
    } else {
      setStatus('idle');
    }
  }, [value, checkSlug]);

  const handleGenerateSlug = () => {
    if (stageName) {
      const generated = generateSlug(stageName);
      onChange(generated);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="url-amigavel-do-artista"
            className={cn(
              "pr-8",
              status === 'available' && "border-green-500",
              status === 'taken' && "border-red-500"
            )}
          />
          {checking && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2" />
          )}
          {!checking && status === 'available' && (
            <CheckCircle className="w-4 h-4 text-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
          )}
          {!checking && status === 'taken' && (
            <AlertTriangle className="w-4 h-4 text-red-500 absolute right-2 top-1/2 -translate-y-1/2" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleGenerateSlug}
          disabled={!stageName}
          className="gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Gerar
        </Button>
      </div>
      
      {status === 'taken' && suggestion && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-600">Slug já existe.</span>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => onChange(suggestion)}
          >
            Usar: {suggestion}
          </Button>
        </div>
      )}
    </div>
  );
};

export function ArtistForm({ initialData, mode }: ArtistFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const form = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      stage_name: initialData?.stage_name || '',
      slug: initialData?.slug || '',
      artist_type: (initialData?.artist_type as any) || 'artist',
      status: (initialData?.status as any) || 'active',
      city: initialData?.city || '',
      instagram: initialData?.instagram || '',
      booking_email: initialData?.booking_email || '',
      booking_whatsapp: initialData?.booking_whatsapp || '',
      bio_short: initialData?.bio_short || '',
      profile_image_url: initialData?.profile_image_url || ''
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors: formErrors } } = form;
  const stageName = watch('stage_name');
  const slug = watch('slug');

  const onSubmit = async (data: ArtistFormData) => {
    try {
      setSubmitting(true);
      setErrors([]);
      
      if (mode === 'create') {
        const { error } = await supabase
          .from('artists')
          .insert([data]);
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            setErrors(['Slug já está em uso. Tente outro.']);
            return;
          }
          throw error;
        }
        
        toast({
          title: "Sucesso",
          description: "Artista criado com sucesso"
        });
        
        navigate('/admin-v3/artists');
      } else {
        const { error } = await supabase
          .from('artists')
          .update(data)
          .eq('id', initialData!.id);
        
        if (error) {
          if (error.code === '23505') {
            setErrors(['Slug já está em uso. Tente outro.']);
            return;
          }
          throw error;
        }
        
        toast({
          title: "Sucesso", 
          description: "Artista atualizado com sucesso"
        });
        
        navigate('/admin-v3/artists');
      }
    } catch (error: any) {
      console.error('Erro ao salvar artista:', error);
      
      // Identificar campos obrigatórios em falta
      if (error.message?.includes('null value in column')) {
        const missingFields = [];
        if (error.message.includes('booking_email')) missingFields.push('Email de contato');
        if (error.message.includes('booking_whatsapp')) missingFields.push('WhatsApp');
        if (error.message.includes('bio_short')) missingFields.push('Bio curta');
        if (error.message.includes('profile_image_url')) missingFields.push('URL da imagem');
        
        if (missingFields.length > 0) {
          setErrors([`Campos obrigatórios em falta: ${missingFields.join(', ')}`]);
          return;
        }
      }
      
      setErrors([error.message || 'Erro ao salvar artista']);
      toast({
        title: "Erro",
        description: "Falha ao salvar artista",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-v3/artists');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'create' ? 'Novo Artista' : 'Editar Artista'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'create' ? 'Adicione um novo artista ao sistema' : 'Atualize as informações do artista'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={!form.formState.isValid || !form.formState.isDirty || submitting}
            className="gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'create' ? 'Criar Artista' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Error summary */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage_name">Nome Artístico *</Label>
                <Input
                  id="stage_name"
                  {...register('stage_name')}
                  placeholder="Nome do artista/banda"
                />
                {formErrors.stage_name && (
                  <p className="text-sm text-red-600">{formErrors.stage_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <SlugChecker
                  value={slug}
                  onChange={(value) => setValue('slug', value)}
                  stageName={stageName}
                />
                {formErrors.slug && (
                  <p className="text-sm text-red-600">{formErrors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist_type">Tipo *</Label>
                 <Select 
                   value={watch('artist_type') ?? undefined} 
                   onValueChange={(value) => setValue('artist_type', value as any)}
                 >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTIST_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.artist_type && (
                  <p className="text-sm text-red-600">{formErrors.artist_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                 <Select 
                   value={watch('status') ?? undefined} 
                   onValueChange={(value) => setValue('status', value as any)}
                 >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Select 
                  value={watch('city') || undefined} 
                  onValueChange={(value) => setValue('city', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    
                    {CITIES.map(city => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...register('instagram')}
                  placeholder="@usuario ou URL completa"
                />
                {formErrors.instagram && (
                  <p className="text-sm text-red-600">{formErrors.instagram.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: @usuario ou https://instagram.com/usuario
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Fields (Database constraints) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Campos Obrigatórios</CardTitle>
            <p className="text-sm text-muted-foreground">
              Estes campos são obrigatórios devido às restrições do banco de dados
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking_email">Email de Contato *</Label>
                <Input
                  id="booking_email"
                  type="email"
                  {...register('booking_email')}
                  placeholder="contato@artista.com"
                />
                {formErrors.booking_email && (
                  <p className="text-sm text-red-600">{formErrors.booking_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_whatsapp">WhatsApp *</Label>
                <Input
                  id="booking_whatsapp"
                  {...register('booking_whatsapp')}
                  placeholder="+55 11 99999-9999"
                />
                {formErrors.booking_whatsapp && (
                  <p className="text-sm text-red-600">{formErrors.booking_whatsapp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio_short">Bio Curta *</Label>
                <Input
                  id="bio_short"
                  {...register('bio_short')}
                  placeholder="Breve descrição do artista"
                />
                {formErrors.bio_short && (
                  <p className="text-sm text-red-600">{formErrors.bio_short.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_image_url">URL da Imagem de Perfil *</Label>
                <Input
                  id="profile_image_url"
                  type="url"
                  {...register('profile_image_url')}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {formErrors.profile_image_url && (
                  <p className="text-sm text-red-600">{formErrors.profile_image_url.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}