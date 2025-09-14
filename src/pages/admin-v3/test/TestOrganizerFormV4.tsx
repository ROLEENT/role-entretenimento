import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { OrganizerFormV4 } from '@/components/admin/forms-v4';

const TestOrganizerFormV4: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log("TestOrganizerFormV4 - Form submitted:", data);
    // Após salvar com sucesso, navegar de volta
    navigate('/admin-v3/agentes/organizadores');
  };

  const handleBack = () => {
    navigate('/admin-v3/agentes/organizadores');
  };

  return (
    <AdminPageWrapper
      title="Teste Formulário V4 - Organizador"
      description="Teste da nova arquitetura de formulários unificada"
    >
      <OrganizerFormV4
        onSubmit={handleSubmit}
        onBack={handleBack}
      />
    </AdminPageWrapper>
  );
};

export default TestOrganizerFormV4;