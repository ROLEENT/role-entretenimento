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

import { artistFlexibleSchema, ArtistFlexibleForm } from '@/schemas/agents-flexible';

export type ArtistFormData = ArtistFlexibleForm;

interface AdminArtistFormProps {
  artist?: Partial<ArtistFlexibleForm>;
  onSubmit: (data: ArtistFlexibleForm) => void;
  isLoading?: boolean;
}

export const AdminArtistForm: React.FC<AdminArtistFormProps> = ({
  artist,
  onSubmit,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  const form = useForm<ArtistFlexibleForm>({
    resolver: zodResolver(artistFlexibleSchema),
    defaultValues: {
      stage_name: '',
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


  const handleSubmit = (data: ArtistFlexibleForm) => {
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