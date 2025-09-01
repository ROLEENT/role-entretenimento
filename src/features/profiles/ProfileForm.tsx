import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Upload, User, Building, Users, Camera, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileEvents } from "@/lib/telemetry";
import { 
  commonSchema, 
  artistProfileSchema, 
  venueProfileSchema, 
  orgProfileSchema,
  type CreateProfile 
} from "./schemas";
import { createProfile } from "./service";

type Step = 'basic' | 'media' | 'specific' | 'review';

const STEPS: { id: Step; title: string; description: string }[] = [
  { id: 'basic', title: 'Dados Básicos', description: 'Informações principais do perfil' },
  { id: 'media', title: 'Mídia', description: 'Avatar e imagem de capa' },
  { id: 'specific', title: 'Específicos', description: 'Dados específicos do tipo' },
  { id: 'review', title: 'Revisão', description: 'Confirme os dados antes de criar' }
];

const TYPE_OPTIONS = [
  { value: 'artista', label: 'Artista', icon: User },
  { value: 'local', label: 'Local', icon: Building },
  { value: 'organizador', label: 'Organizador', icon: Users }
];

export default function ProfileForm() {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleError, setHandleError] = useState<string | null>(null);
  const [avatarAlt, setAvatarAlt] = useState('');
  const [coverAlt, setCoverAlt] = useState('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateProfile>({
    resolver: zodResolver(commonSchema),
    defaultValues: {
      type: 'artista',
      visibility: 'public',
      country: 'BR',
      bio_short: '',
      bio: '',
      tags: [],
      links: []
    }
  });

  // Track form start
  useState(() => {
    profileEvents.createStart(form.getValues('type'));
  });

  const type = form.watch('type');
  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);

  // Schema baseado no tipo selecionado
  const getValidationSchema = () => {
    switch (type) {
      case 'artista': return artistProfileSchema;
      case 'local': return venueProfileSchema;
      case 'organizador': return orgProfileSchema;
      default: return commonSchema;
    }
  };

  const validateHandle = async (handle: string) => {
    if (!handle || handle.length < 3) {
      setHandleError(null);
      return;
    }

    setIsCheckingHandle(true);
    setHandleError(null);

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', handle.toLowerCase())
        .maybeSingle();
      
      if (data) {
        setHandleError('Este handle já está em uso');
        profileEvents.handleCheck(handle, false);
      } else {
        profileEvents.handleCheck(handle, true);
      }
    } catch (error) {
      console.error('Erro ao validar handle:', error);
      setHandleError('Erro ao verificar disponibilidade');
    } finally {
      setIsCheckingHandle(false);
    }
  };

  const handleImageUpload = (file: File, type: 'avatar' | 'cover') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem');
      return;
    }

    // Validações específicas por tipo
    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 8 * 1024 * 1024; // 5MB avatar, 8MB cover
    if (file.size > maxSize) {
      toast.error(`Imagem deve ter menos de ${type === 'avatar' ? '5MB' : '8MB'}`);
      return;
    }

    // Verificar formato
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Apenas arquivos JPG e PNG são aceitos');
      return;
    }

    // Track upload
    profileEvents.imageUpload(type, file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Verificar dimensões mínimas
      const img = new Image();
      img.onload = () => {
        const minWidth = type === 'avatar' ? 320 : 1920;
        const minHeight = type === 'avatar' ? 320 : 640;
        
        if (img.width < minWidth || img.height < minHeight) {
          toast.error(`Imagem deve ter pelo menos ${minWidth}x${minHeight} pixels`);
          return;
        }
        
        if (type === 'avatar') {
          setAvatarPreview(result);
          form.setValue('avatar_file', file);
        } else {
          setCoverPreview(result);
          form.setValue('cover_file', file);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'avatar' | 'cover') => {
    if (type === 'avatar') {
      setAvatarPreview(null);
      form.setValue('avatar_file', undefined);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    } else {
      setCoverPreview(null);
      form.setValue('cover_file', undefined);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const validateCurrentStep = async () => {
    const values = form.getValues();
    
    try {
      if (currentStep === 'basic') {
        commonSchema.parse(values);
      } else if (currentStep === 'specific') {
        getValidationSchema().parse(values);
      }
      return true;
    } catch (error: any) {
      toast.error('Preencha todos os campos obrigatórios');
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStepId = STEPS[nextIndex].id;
      setCurrentStep(nextStepId);
      profileEvents.stepProgress(nextStepId, form.getValues('type'));
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const onSubmit = async (data: CreateProfile) => {
    setIsSubmitting(true);
    
    try {
      // Validação final
      getValidationSchema().parse(data);
      
      // Validar alt text obrigatório para imagens
      if (data.avatar_file && !avatarAlt.trim()) {
        toast.error('Descrição do avatar é obrigatória para acessibilidade');
        setIsSubmitting(false);
        return;
      }
      
      if (data.cover_file && !coverAlt.trim()) {
        toast.error('Descrição da capa é obrigatória para acessibilidade');
        setIsSubmitting(false);
        return;
      }
      
      // Criar perfil (sem avatar_alt/cover_alt no data para evitar erro de tipo)
      const profileData = { ...data };
      const profileId = await createProfile(profileData);
      
      profileEvents.createSuccess(profileId, data.type);
      toast.success('Perfil criado com sucesso!');
      window.location.href = `/perfil/${data.handle}`;
    } catch (error: any) {
      console.error('Erro ao criar perfil:', error);
      toast.error(error.message || 'Erro ao criar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicStep = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Perfil</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do perfil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="handle"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="handle">Handle</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    id="handle"
                    placeholder="username" 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      field.onChange(value);
                      setHandleError(null);
                    }}
                    onBlur={() => validateHandle(field.value)}
                    className={handleError ? 'border-destructive' : ''}
                    aria-describedby="handle-description handle-error"
                  />
                  {isCheckingHandle && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription id="handle-description">
                3-30 caracteres, apenas letras, números e pontos
              </FormDescription>
              {handleError && (
                <p id="handle-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {handleError}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input placeholder="São Paulo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input placeholder="SP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <Input placeholder="BR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="bio_short"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio Curta</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descrição breve do perfil..." 
                className="max-h-24"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Máximo 160 caracteres
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio Completa (Opcional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descrição detalhada do perfil..." 
                className="min-h-32"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Máximo 1200 caracteres
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de Contato (Opcional)</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="contato@exemplo.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visibilidade</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderMediaStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Imagens do Perfil</h3>
        <p className="text-muted-foreground">
          Adicione um avatar e uma imagem de capa para personalizar seu perfil
        </p>
      </div>

      {/* Avatar */}
      <div className="space-y-4">
        <FormLabel htmlFor="avatar-upload">Avatar</FormLabel>
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarPreview || undefined} alt={avatarAlt || 'Avatar do perfil'} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => avatarInputRef.current?.click()}
              aria-describedby="avatar-requirements"
            >
              <Upload className="w-4 h-4 mr-2" />
              Carregar Avatar
            </Button>
            {avatarPreview && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeImage('avatar')}
                aria-label="Remover avatar"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {avatarPreview && (
          <div className="space-y-2">
            <FormLabel htmlFor="avatar-alt">Descrição do Avatar (Acessibilidade)</FormLabel>
            <Input
              id="avatar-alt"
              placeholder="Descrição do avatar para leitores de tela"
              value={avatarAlt}
              onChange={(e) => setAvatarAlt(e.target.value)}
              required
            />
          </div>
        )}
        <p id="avatar-requirements" className="text-xs text-muted-foreground">
          Mínimo 320x320px, JPG/PNG até 5MB
        </p>
        <input
          ref={avatarInputRef}
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, 'avatar');
          }}
          aria-describedby="avatar-requirements"
        />
      </div>

      {/* Cover */}
      <div className="space-y-4">
        <FormLabel htmlFor="cover-upload">Imagem de Capa</FormLabel>
        <div className="space-y-4">
          {coverPreview ? (
            <div className="relative">
              <img
                src={coverPreview}
                alt={coverAlt || 'Imagem de capa do perfil'}
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeImage('cover')}
                aria-label="Remover capa"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nenhuma capa selecionada</p>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => coverInputRef.current?.click()}
            aria-describedby="cover-requirements"
          >
            <Upload className="w-4 h-4 mr-2" />
            Carregar Capa
          </Button>
        </div>
        {coverPreview && (
          <div className="space-y-2">
            <FormLabel htmlFor="cover-alt">Descrição da Capa (Acessibilidade)</FormLabel>
            <Input
              id="cover-alt"
              placeholder="Descrição da capa para leitores de tela"
              value={coverAlt}
              onChange={(e) => setCoverAlt(e.target.value)}
              required
            />
          </div>
        )}
        <p id="cover-requirements" className="text-xs text-muted-foreground">
          Mínimo 1920x640px, JPG/PNG até 8MB
        </p>
        <input
          ref={coverInputRef}
          id="cover-upload"
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, 'cover');
          }}
          aria-describedby="cover-requirements"
        />
      </div>
    </div>
  );

  const renderSpecificStep = () => {
    if (type === 'artista') {
      return (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="genres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gêneros Musicais</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Rock, Pop, Jazz (separados por vírgula)"
                    onChange={(e) => {
                      const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
                      field.onChange(genres);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Separe os gêneros por vírgula
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="agency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agência (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da agência" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fee_band"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa de Cachê (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a faixa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="<=2k">Até R$ 2.000</SelectItem>
                      <SelectItem value="2-5k">R$ 2.000 - R$ 5.000</SelectItem>
                      <SelectItem value="5-10k">R$ 5.000 - R$ 10.000</SelectItem>
                      <SelectItem value="10k+">Acima de R$ 10.000</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="spotify_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spotify ID (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ID do Spotify" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="youtube_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/@usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      );
    }

    if (type === 'local') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="100"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Política de Idade</FormLabel>
                  <FormControl>
                    <Input placeholder="18+, livre, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="price_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faixa de Preço (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a faixa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="$">$ - Econômico</SelectItem>
                    <SelectItem value="$$">$$ - Médio</SelectItem>
                    <SelectItem value="$$$">$$$ - Premium</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0001-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    if (type === 'organizador') {
      return (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="brand_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Marca (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa/marca" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="manager_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manager_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Responsável (Opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="responsavel@empresa.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobre (Opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informações sobre a organização..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    }

    return null;
  };

  const renderReviewStep = () => {
    const values = form.getValues();
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Revisar Dados</h3>
          <p className="text-muted-foreground">
            Confira as informações antes de criar o perfil
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const typeOption = TYPE_OPTIONS.find(t => t.value === values.type);
                if (typeOption) {
                  const Icon = typeOption.icon;
                  return <Icon className="w-5 h-5" />;
                }
                return null;
              })()}
              {values.name}
            </CardTitle>
            <CardDescription>@{values.handle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{values.name}</p>
                <p className="text-sm text-muted-foreground">
                  {values.city}, {values.state}
                </p>
                <Badge variant="secondary">{values.visibility}</Badge>
              </div>
            </div>
            
            {values.bio_short && (
              <p className="text-sm">{values.bio_short}</p>
            )}
            
            {values.contact_email && (
              <p className="text-sm">📧 {values.contact_email}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Criar Perfil</h1>
        <p className="text-muted-foreground">
          Complete as etapas para criar seu perfil
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className={`text-sm font-medium ${
                index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.title}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-4 ${
                index < currentStepIndex ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStepIndex].title}</CardTitle>
              <CardDescription>
                {STEPS[currentStepIndex].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 'basic' && renderBasicStep()}
              {currentStep === 'media' && renderMediaStep()}
              {currentStep === 'specific' && renderSpecificStep()}
              {currentStep === 'review' && renderReviewStep()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep === 'review' ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Perfil'}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}