import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminV3Guard } from '@/components/AdminV3Guard';
import { AdminV3Header } from '@/components/AdminV3Header';
import { FormShell } from '@/components/form';
import { Form } from '@/components/ui/form';
import { AdminV3Breadcrumb } from '@/components/admin/common/AdminV3Breadcrumb';
import { AdminVenueForm } from '@/components/admin/venues/AdminVenueForm';
import { venueFlexibleSchema, VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { useUpsertVenue } from '@/hooks/useUpsertAgents';

const AdminV3VenueCreate: React.FC = () => {
  const navigate = useNavigate();
  const upsertVenue = useUpsertVenue();

  const form = useForm<VenueFlexibleFormData>({
    resolver: zodResolver(venueFlexibleSchema),
    defaultValues: {
      name: '',
      status: 'active',
    },
  });

  const handleSaveAndExit = async (data: VenueFlexibleFormData) => {
    try {
      await upsertVenue.mutateAsync(data);
      navigate('/admin-v3/agentes/venues');
    } catch (error) {
      console.error('Error creating venue:', error);
    }
  };

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Locais', path: '/admin-v3/agentes/venues' },
    { label: 'Novo Local' },
  ];

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <main className="container mx-auto px-4 py-8">
        <AdminV3Breadcrumb items={breadcrumbs} />
        
        <Form {...form}>
          <FormShell
            title="Criar Novo Local"
            description="Cadastre um novo espaço cultural, casa de shows, bar ou clube"
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

export default AdminV3VenueCreate;