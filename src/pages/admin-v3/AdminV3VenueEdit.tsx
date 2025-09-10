import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';

import { FormShell } from '@/components/form';
import { Form } from '@/components/ui/form';

import { AdminVenueEnhancedForm } from '@/components/admin/forms/AdminVenueEnhancedForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { venueEnhancedSchema, VenueEnhancedForm } from '@/schemas/entities/venue-enhanced';
import { useUpsertVenueEnhanced } from '@/hooks/useUpsertEnhanced';
import { ProfileGenerationButton } from '@/components/admin/agents/ProfileGenerationButton';

const AdminV3VenueEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const upsertVenue = useUpsertVenueEnhanced();

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

  const form = useForm<VenueEnhancedForm>({
    resolver: zodResolver(venueEnhancedSchema),
    defaultValues: {
      name: '',
      type: 'bar',
      status: 'draft',
      country: 'Brasil',
      tags: [],
      gallery: [],
      address_line: '',
      district: '',
      city: '',
      state: '',
      postal_code: '',
      bio_short: '',
      phone: '',
      instagram: '',
      logo_url: '',
      logo_alt: '',
    },
  });

  useEffect(() => {
    if (venue) {
      // Transform venue data to enhanced form format
      const enhancedData: VenueEnhancedForm = {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        type: venue.caracteristicas_estabelecimento?.type || 'bar',
        address_line: venue.address_line || '',
        district: venue.district || '',
        city: venue.city || '',
        state: venue.state || '',
        postal_code: venue.postal_code || '',
        country: venue.country || 'Brasil',
        bio_short: venue.about?.slice(0, 160) || '',
        about: venue.about || '',
        email: venue.email || '',
        phone: venue.phone || '',
        whatsapp: venue.whatsapp || '',
        instagram: venue.instagram || '',
        website: venue.website || '',
        logo_url: venue.logo_url || '',
        logo_alt: venue.logo_alt || '',
        cover_url: venue.cover_url || '',
        cover_alt: venue.cover_alt || '',
        gallery: venue.gallery_urls?.map(url => ({ url, alt: '', caption: '' })) || [],
        latitude: venue.latitude,
        longitude: venue.longitude,
        capacity: venue.capacity,
        opening_hours: venue.opening_hours || {},
        features: venue.estruturas || {},
        status: venue.status === 'active' ? 'published' : 'draft',
        priority: 0,
        tags: venue.tags || [],
        bar_style: [],
        ambient_type: [],
        drink_specialties: [],
        music_genres: [],
      };
      form.reset(enhancedData);
    }
  }, [venue, form]);

  const handleSaveAndExit = async (data: VenueEnhancedForm) => {
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
      <main className="space-y-6">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="space-y-6">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{`Editar Local: ${venue?.name}`}</h1>
            <p className="text-muted-foreground">Atualize as informações do local</p>
          </div>
          {venue && (
            <ProfileGenerationButton
              agentData={{
                id: venue.id,
                name: venue.name,
                slug: venue.slug,
                city: venue.city,
                state: venue.state,
                country: venue.country,
                bio_short: venue.about?.slice(0, 160),
                bio: venue.about,
                avatar_url: venue.cover_url,
                cover_url: venue.cover_url,
                tags: venue.tags,
                instagram: venue.instagram,
                website: venue.website,
                email: venue.email,
              }}
              agentType="local"
            />
          )}
        </div>

        <Form {...form}>
          <FormShell
            title=""
            description=""
            form={form}
            onSaveAndExit={handleSaveAndExit}
            backUrl="/admin-v3/agentes/venues"
            isSubmitting={upsertVenue.isPending}
          >
            <AdminVenueEnhancedForm venue={venue} onSubmit={handleSaveAndExit} isLoading={upsertVenue.isPending} />
          </FormShell>
        </Form>
    </main>
  );
};

export default AdminV3VenueEdit;