import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArtistBasicTab } from './tabs/ArtistBasicTab';
import { ArtistContactTab } from './tabs/ArtistContactTab';
import { ArtistProfessionalTab } from './tabs/ArtistProfessionalTab';
import { ArtistMediaTab } from './tabs/ArtistMediaTab';
import { ArtistManagementTab } from './tabs/ArtistManagementTab';

// Complete artist schema based on the database table
const artistSchema = z.object({
  // Basic info
  name: z.string().min(1, 'Nome é obrigatório'),
  stage_name: z.string().min(1, 'Nome artístico é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  artist_type: z.string().min(1, 'Tipo de artista é obrigatório'),
  status: z.enum(['active', 'inactive']).default('active'),
  bio_short: z.string().optional(),
  bio_long: z.string().optional(),
  bio: z.string().optional(),
  about: z.string().optional(),
  
  // Contact info
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  booking_email: z.string().email().optional().or(z.literal('')),
  booking_whatsapp: z.string().optional(),
  booking_phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('BR'),
  home_city: z.string().optional(),
  cities_active: z.array(z.string()).default([]),
  
  // Social media
  instagram: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  spotify_url: z.string().url().optional().or(z.literal('')),
  soundcloud_url: z.string().url().optional().or(z.literal('')),
  youtube_url: z.string().url().optional().or(z.literal('')),
  beatport_url: z.string().url().optional().or(z.literal('')),
  audius_url: z.string().url().optional().or(z.literal('')),
  links: z.record(z.string()).optional(),
  
  // Professional info
  fee_range: z.string().optional(),
  show_format: z.string().optional(),
  team_size: z.number().optional(),
  set_time_minutes: z.number().optional(),
  availability_days: z.array(z.string()).default([]),
  
  // Technical requirements
  tech_audio: z.string().optional(),
  tech_light: z.string().optional(),
  tech_stage: z.string().optional(),
  tech_rider_url: z.string().url().optional().or(z.literal('')),
  
  // Media
  profile_image_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
  presskit_url: z.string().url().optional().or(z.literal('')),
  
  // Management
  responsible_name: z.string().optional(),
  responsible_role: z.string().optional(),
  real_name: z.string().optional(),
  pronouns: z.string().optional(),
  accommodation_notes: z.string().optional(),
  internal_notes: z.string().optional(),
  image_credits: z.string().optional(),
  image_rights_authorized: z.boolean().default(false),
  priority: z.number().default(0),
  tags: z.array(z.string()).default([]),
});

export type ArtistFormData = z.infer<typeof artistSchema>;

interface AdminArtistFormProps {
  artist?: Partial<ArtistFormData>;
  onSubmit: (data: ArtistFormData) => void;
  isLoading?: boolean;
}

export const AdminArtistForm: React.FC<AdminArtistFormProps> = ({
  artist,
  onSubmit,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  const form = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: '',
      stage_name: '',
      slug: '',
      artist_type: '',
      status: 'active',
      country: 'BR',
      cities_active: [],
      availability_days: [],
      links: {},
      image_rights_authorized: false,
      priority: 0,
      tags: [],
      ...artist,
    },
  });

  // Auto-generate slug from stage_name
  const stageName = form.watch('stage_name');
  useEffect(() => {
    if (stageName && !artist?.slug) {
      const slug = stageName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  }, [stageName, form, artist?.slug]);

  // Auto-fill name from stage_name if empty
  useEffect(() => {
    if (stageName && !form.getValues('name') && !artist?.name) {
      form.setValue('name', stageName);
    }
  }, [stageName, form, artist?.name]);

  const handleSubmit = (data: ArtistFormData) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin-v3/agentes/artistas')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {artist ? 'Editar Artista' : 'Novo Artista'}
            </h1>
            <p className="text-muted-foreground">
              {artist ? 'Atualize as informações do artista' : 'Cadastre um novo artista no sistema'}
            </p>
          </div>
        </div>
        
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Artista</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="contact">Contato</TabsTrigger>
                  <TabsTrigger value="professional">Profissional</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                  <TabsTrigger value="management">Gestão</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <ArtistBasicTab form={form} />
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                  <ArtistContactTab form={form} />
                </TabsContent>

                <TabsContent value="professional" className="space-y-6">
                  <ArtistProfessionalTab form={form} />
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                  <ArtistMediaTab form={form} />
                </TabsContent>

                <TabsContent value="management" className="space-y-6">
                  <ArtistManagementTab form={form} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};