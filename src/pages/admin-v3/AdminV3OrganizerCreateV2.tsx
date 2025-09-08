import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminOrganizerFormV2 } from '@/components/admin/agents/AdminOrganizerFormV2';
import { useCreateOrganizerV2 } from '@/hooks/useCreateOrganizerV2';
import { OrganizerFormDataV2 } from '@/lib/organizerSchemaV2';

const AdminV3OrganizerCreateV2: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createOrganizer, isPending } = useCreateOrganizerV2();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Organizadores', path: '/admin-v3/agentes/organizadores' },
    { label: 'Novo Organizador V2' },
  ];

  const handleSubmit = (data: OrganizerFormDataV2) => {
    createOrganizer(data, {
      onSuccess: (result) => {
        console.log('Organizador criado com sucesso:', result);
        navigate('/admin-v3/agentes/organizadores');
      },
    });
  };

  return (
    <AdminPageWrapper
      title="Novo Organizador V2"
      description="Formulário simplificado e confiável para criar organizadores"
      breadcrumbs={breadcrumbs}
    >
      <AdminOrganizerFormV2
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3OrganizerCreateV2;