import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrganizerBasicTab } from './tabs/OrganizerBasicTab';
import { OrganizerContactTab } from './tabs/OrganizerContactTab';
import { OrganizerMediaTab } from './tabs/OrganizerMediaTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { organizerFlexibleSchema, OrganizerFlexibleForm } from '@/schemas/agents-flexible';

export type OrganizerFormData = OrganizerFlexibleForm;

interface AdminOrganizerFormProps {
  organizer?: Partial<OrganizerFlexibleForm>;
  onSubmit: (data: OrganizerFlexibleForm) => void;
  isLoading?: boolean;
}

export const AdminOrganizerForm: React.FC<AdminOrganizerFormProps> = ({
  organizer,
  onSubmit,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  const form = useForm<OrganizerFlexibleForm>({
    resolver: zodResolver(organizerFlexibleSchema),
    defaultValues: {
      name: '',
      slug: '',
      status: 'active',
      bio: '',
      email: '',
      phone: '',
      instagram: '',
      website: '',
      avatar_url: '',
      ...organizer,
    },
  });

  // Auto-generate slug from name
  const name = form.watch('name');
  useEffect(() => {
    if (name && !organizer?.slug) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  }, [name, form, organizer?.slug]);

  const handleSubmit = (data: OrganizerFlexibleForm) => {
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
            onClick={() => navigate('/admin-v3/agentes/organizadores')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {organizer ? 'Editar Organizador' : 'Novo Organizador'}
            </h1>
            <p className="text-muted-foreground">
              {organizer ? 'Atualize as informações do organizador' : 'Cadastre um novo organizador no sistema'}
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
              <CardTitle>Informações do Organizador</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="contact">Contato</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <OrganizerBasicTab form={form} />
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                  <OrganizerContactTab form={form} />
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                  <OrganizerMediaTab form={form} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};