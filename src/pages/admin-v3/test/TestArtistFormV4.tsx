import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { ArtistFormV4 } from '@/components/admin/forms-v4';

const TestArtistFormV4: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log("TestArtistFormV4 - Form submitted:", data);
    // Após salvar com sucesso, navegar de volta
    navigate('/admin-v3/agentes/artistas');
  };

  const handleBack = () => {
    navigate('/admin-v3/agentes/artistas');
  };

  return (
    <AdminPageWrapper
      title="Teste Formulário V4 - Artista"
      description="Teste da nova arquitetura de formulários unificada"
    >
      <ArtistFormV4
        onSubmit={handleSubmit}
        onBack={handleBack}
      />
    </AdminPageWrapper>
  );
};

export default TestArtistFormV4;