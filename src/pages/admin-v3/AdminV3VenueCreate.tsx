import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormShell } from '@/components/form';
import { Form } from '@/components/ui/form';

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
    <main className="space-y-6">
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
  );
};

export default AdminV3VenueCreate;