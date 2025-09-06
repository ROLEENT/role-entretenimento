import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminV3Guard } from '@/components/AdminV3Guard';

import { FormShell } from '@/components/form';
import { Form } from '@/components/ui/form';
import { AdminV3Breadcrumb } from '@/components/admin/common/AdminV3Breadcrumb';
import { AdminVenueForm } from '@/components/admin/venues/AdminVenueForm';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { venueFlexibleSchema, VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { useUpsertVenue } from '@/hooks/useUpsertAgents';
import { ProfileGenerationButton } from '@/components/admin/agents/ProfileGenerationButton';

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

  const form = useForm<VenueFlexibleFormData>({
    resolver: zodResolver(venueFlexibleSchema),
    defaultValues: {
      name: '',
      status: 'active',
      // Complete default values for all boolean fields
      estruturas: {
        ar_condicionado: false,
        wifi: false,
        aquecimento: false,
        estacionamento: false,
        aceita_pets: false,
        area_fumantes: false,
        pista_danca: false,
        area_vip: false,
        rooftop: false,
        estacoes_carregamento: false,
        lugares_sentados: false,
      },
      diferenciais: {
        dj: false,
        happy_hour: false,
        mesa_bilhar: false,
        jogos_arcade: false,
        karaoke: false,
        narguile: false,
        transmissao_eventos_esportivos: false,
        shows_ao_vivo: false,
        stand_up: false,
        musica_ao_vivo: false,
        amigavel_lgbtqia: false,
      },
      bebidas: {
        menu_cervejas: false,
        cervejas_artesanais: false,
        coqueteis_classicos: false,
        coqueteis_autorais: false,
        menu_vinhos: false,
      },
      cozinha: {
        serve_comida: false,
        opcoes_veganas: false,
        opcoes_vegetarianas: false,
        opcoes_sem_gluten: false,
        opcoes_sem_lactose: false,
        menu_kids: false,
      },
      seguranca: {
        equipe_seguranca: false,
        bombeiros_local: false,
        saidas_emergencia_sinalizadas: false,
      },
      acessibilidade: {
        elevador_acesso: false,
        rampa_cadeirantes: false,
        banheiro_acessivel: false,
        cardapio_braille: false,
        audio_acessivel: false,
        area_caes_guia: false,
      },
      banheiros: {
        masculinos: 0,
        femininos: 0,
        genero_neutro: 0,
      },
      opening_hours: {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
      },
      caracteristicas_estabelecimento: {},
      tags: "",
      gallery_urls: [],
    },
  });

  useEffect(() => {
    if (venue) {
      form.reset(venue);
    }
  }, [venue, form]);

  const handleSaveAndExit = async (data: VenueFlexibleFormData) => {
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
        <main className="container mx-auto px-4 py-8">
          <AdminV3Breadcrumb items={breadcrumbs} />
          <LoadingSpinner />
        </main>
      </AdminV3Guard>
    );
  }

  return (
    <AdminV3Guard>
      <main className="container mx-auto px-4 py-8">
        <AdminV3Breadcrumb items={breadcrumbs} />
        
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
            <AdminVenueForm form={form} />
          </FormShell>
        </Form>
      </main>
    </AdminV3Guard>
  );
};

export default AdminV3VenueEdit;