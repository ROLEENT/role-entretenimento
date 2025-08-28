import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminForm } from '@/components/admin/AdminForm';
import { useAdminToast } from '@/hooks/useAdminToast';
import { useArtistManagement } from '@/hooks/useArtistManagement';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { artistSchema, type ArtistFormData } from '@/lib/artistSchema';
import { withAdminAuth } from '@/components/withAdminAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ArtistFormProps {
  mode: 'create' | 'edit';
}

function ArtistForm({ mode }: ArtistFormProps) {
  console.log('[ARTIST FORM] Inicializando com mode:', mode);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<ArtistFormData>>({});
  
  console.log('[ARTIST FORM] Hooks inicializados');
  
  const { showSuccess, showError } = useAdminToast();
  console.log('[ARTIST FORM] useAdminToast:', { showSuccess, showError });
  
  const { createArtist, updateArtist, getArtist, loading } = useArtistManagement();
  console.log('[ARTIST FORM] useArtistManagement:', { createArtist, updateArtist, getArtist, loading });
  
  const { user } = useSecureAuth();
  console.log('[ARTIST FORM] useSecureAuth user:', user);

  useEffect(() => {
    console.log('[ARTIST FORM] useEffect executando');
    const fetchArtist = async () => {
      if (mode === 'edit' && id) {
        try {
          console.log('[ARTIST FORM] Buscando artista:', id);
          const artist = await getArtist(id);
          if (artist) {
            setInitialData(artist);
          }
        } catch (error) {
          console.error('[ARTIST FORM] Erro ao buscar artista:', error);
          showError(error, 'Erro ao carregar dados do artista');
        }
      }
    };

    fetchArtist();
  }, [mode, id]);

  const onSubmit = async (data: ArtistFormData) => {
    setIsSubmitting(true);
    try {
      // Generate slug from stage name
      const slug = data.stage_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const artistData = { ...data, slug };

      if (mode === 'create') {
        await createArtist(artistData);
        showSuccess('Artista criado com sucesso!');
      } else {
        await updateArtist(id!, artistData);
        showSuccess('Artista atualizado com sucesso!');
      }
      
      navigate('/admin-v2/artists');
    } catch (error) {
      showError(error, `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} artista`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  const fields = [
    // Required fields
    { name: 'stage_name', label: 'Nome Artístico', type: 'text' as const, required: true, section: 'required' },
    { name: 'artist_type', label: 'Tipo de Artista', type: 'select' as const, required: true, section: 'required',
      options: [
        { value: 'banda', label: 'Banda' },
        { value: 'dj', label: 'DJ' },
        { value: 'solo', label: 'Artista Solo' },
        { value: 'drag', label: 'Drag' }
      ]
    },
    { name: 'city', label: 'Cidade Principal', type: 'text' as const, required: true, section: 'required' },
    { name: 'instagram', label: 'Instagram', type: 'text' as const, required: true, section: 'required' },
    { name: 'booking_email', label: 'Email de Contato', type: 'email' as const, required: true, section: 'required' },
    { name: 'booking_whatsapp', label: 'WhatsApp', type: 'text' as const, required: true, section: 'required' },
    { name: 'bio_short', label: 'Bio Curta', type: 'textarea' as const, required: true, section: 'required', rows: 3 },
    { name: 'profile_image_url', label: 'Foto de Perfil', type: 'file' as const, required: true, section: 'required', bucket: 'artists' },
    
    // Optional fields
    { name: 'bio_long', label: 'Bio Longa', type: 'textarea' as const, section: 'optional', rows: 5 },
    { name: 'real_name', label: 'Nome Real', type: 'text' as const, section: 'optional' },
    { name: 'pronouns', label: 'Pronomes', type: 'text' as const, section: 'optional' },
    { name: 'website_url', label: 'Website', type: 'url' as const, section: 'optional' },
    { name: 'spotify_url', label: 'Spotify', type: 'url' as const, section: 'optional' },
    { name: 'cities_active', label: 'Cidades Ativas', type: 'array' as const, section: 'optional' },
    { name: 'availability_days', label: 'Dias Disponíveis', type: 'array' as const, section: 'optional' },
    { name: 'image_rights_authorized', label: 'Autorização de Uso de Imagem', type: 'checkbox' as const, section: 'optional' }
  ];

  const sections = [
    {
      title: 'Campos Obrigatórios',
      description: 'Informações essenciais do artista',
      fields: fields.filter(f => f.section === 'required').map(f => f.name)
    },
    {
      title: 'Campos Complementares',
      description: 'Informações adicionais do artista',
      fields: fields.filter(f => f.section === 'optional').map(f => f.name)
    }
  ];

  const defaultValues = {
    artist_type: 'banda',
    status: 'active',
    priority: 0,
    image_rights_authorized: false,
    cities_active: [],
    availability_days: [],
    ...initialData
  };

  console.log('[ARTIST FORM] Renderizando formulário:', {
    mode,
    isSubmitting,
    loading,
    userEmail: user?.email,
    fieldsLength: fields.length,
    sectionsLength: sections.length,
    defaultValues
  });

  return (
    <AdminForm
      title={mode === 'create' ? 'Novo Artista' : 'Editar Artista'}
      description={mode === 'create' 
        ? 'Adicione um novo artista à plataforma' 
        : 'Edite as informações do artista'
      }
      schema={artistSchema}
      fields={fields}
      sections={sections}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={() => navigate('/admin-v2/artists')}
      submitLabel={mode === 'create' ? 'Criar Artista' : 'Salvar Alterações'}
      isLoading={isSubmitting}
      isEdit={mode === 'edit'}
      adminEmail={user?.email}
    />
  );
}

export default withAdminAuth(ArtistForm);