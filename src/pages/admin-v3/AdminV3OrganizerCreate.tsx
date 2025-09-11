import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPageWrapper } from '@/components/ui/admin-page-wrapper';
import { AdminOrganizerEnhancedForm } from '@/components/admin/forms/AdminOrganizerEnhancedForm';
import { OrganizerEnhancedForm } from '@/schemas/entities/organizer-enhanced';
import { useUpsertOrganizerFixed } from '@/hooks/useUpsertOrganizerFixed';

const AdminV3OrganizerCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: upsertOrganizer, isPending } = useUpsertOrganizerFixed();

  const breadcrumbs = [
    { label: 'Admin', path: '/admin-v3' },
    { label: 'Agentes', path: '/admin-v3/agentes' },
    { label: 'Organizadores', path: '/admin-v3/agentes/organizadores' },
    { label: 'Novo Organizador' },
  ];

  const handleSubmit = (data: OrganizerEnhancedForm) => {
    console.log("AdminV3OrganizerCreate - handleSubmit called with:", data);
    
    upsertOrganizer(data, {
      onSuccess: (result) => {
        console.log("AdminV3OrganizerCreate - onSuccess:", result);
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
      <AdminOrganizerEnhancedForm
        onSubmit={handleSubmit}
        isLoading={isPending}
      />
    </AdminPageWrapper>
  );
};

export default AdminV3OrganizerCreate;