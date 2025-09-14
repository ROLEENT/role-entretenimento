import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { VenueFormV4 } from '@/components/admin/forms-v4';

const TestVenueFormV4: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log("TestVenueFormV4 - Form submitted:", data);
    // Após salvar com sucesso, navegar de volta
    navigate('/admin-v3/agentes/venues');
  };

  const handleBack = () => {
    navigate('/admin-v3/agentes/venues');
  };

  return (
    <AdminPageWrapper
      title="Teste Formulário V4 - Venue"
      description="Teste da nova arquitetura de formulários unificada"
    >
      <VenueFormV4
        onSubmit={handleSubmit}
        onBack={handleBack}
      />
    </AdminPageWrapper>
  );
};

export default TestVenueFormV4;