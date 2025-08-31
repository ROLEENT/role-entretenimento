import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminOrganizerForm, OrganizerFormData } from '@/components/admin/agents/AdminOrganizerForm';
import { useUpsertOrganizer } from '@/hooks/useUpsertAgents';

const AdminV3OrganizerCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: upsertOrganizer, isPending } = useUpsertOrganizer();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Organizadores', path: '/admin-v3/agentes/organizadores' },
    { label: 'Novo Organizador' },
  ];

  const handleSubmit = (data: OrganizerFormData) => {
    upsertOrganizer(data, {
      onSuccess: (result) => {
        if (result && result.id) {
          navigate(`/admin-v3/agentes/organizadores/${result.id}/edit`);
        } else {
          navigate('/admin-v3/agentes/organizadores');
        }
      },
    });
  };

  return (
    <AdminPageWrapper
      title="Novo Organizador"
      description="Cadastre um novo organizador no sistema"
      breadcrumbs={breadcrumbs}
    >
      <AdminOrganizerForm
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3OrganizerCreate;