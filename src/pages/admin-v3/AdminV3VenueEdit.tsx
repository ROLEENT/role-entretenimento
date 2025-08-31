import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { FormShell } from '@/components/form';
import { Form } from '@/components/ui/form';
import { AdminBreadcrumb } from '@/components/ui/unified-breadcrumb';
import { AdminVenueForm } from '@/components/admin/venues/AdminVenueForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { venueSchema, VenueFormData } from '@/schemas/venue';
import { useUpsertVenue } from '@/hooks/useUpsertAgents';

const AdminV3VenueEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const upsertVenue = useUpsertVenue();

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do local é obrigatório');
      
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching venue:', error);
        throw new Error('Erro ao carregar local');
      }

      return data;
    },
    enabled: !!id,
  });

  const form = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: '',
      slug: '',
      address_line: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'BR',
      email: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      website: '',
      about: '',
      capacity: undefined,
      cover_url: '',
      cover_alt: '',
      gallery_urls: [],
      tags: [],
      amenities: {
        accessible: false,
        stage: false,
        sound: false,
        lighting: false,
        parking: false,
        food: false,
        smoking: false,
      },
      opening_hours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: '',
      },
      status: 'active',
      priority: 0,
    },
  });

  useEffect(() => {
    if (venue) {
      form.reset(venue);
    }
  }, [venue, form]);

  const handleSaveAndExit = async (data: VenueFormData) => {
    try {
      await upsertVenue.mutateAsync({ ...data, id });
      navigate('/admin-v3/agentes/venues');
    } catch (error) {
      console.error('Error updating venue:', error);
    }
  };

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Locais', path: '/admin-v3/agentes/venues' },
    { label: venue?.name || 'Editando...' },
  ];

  if (isLoading) {
    return (
      <AdminV3Guard>
        <AdminV3Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-64">
            <LoadingSpinner />
          </div>
        </main>
      </AdminV3Guard>
    );
  }

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <main className="container mx-auto px-4 py-8">
        <AdminBreadcrumb items={breadcrumbs} />
        
        <Form {...form}>
          <FormShell
            title={`Editar Local: ${venue?.name}`}
            description="Atualize as informações do local"
            form={form}
            onSaveAndExit={handleSaveAndExit}
            backUrl="/admin-v3/agentes/venues"
            isSubmitting={upsertVenue.isPending}
          >
            <AdminVenueForm form={form} />
          </FormShell>
        </Form>
      </main>
    </AdminV3Guard>
  );
};

export default AdminV3VenueEdit;