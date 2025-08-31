import { AdminLayout } from "@/components/admin/AdminLayout";
import { UnderConstructionPage } from "@/components/common/UnderConstructionPage";

export default function OrganizadoresPage() {
  return (
    <AdminLayout>
      <UnderConstructionPage
        title="Organizadores"
        description="Gerenciamento de organizadores, produtoras, coletivos e selos musicais."
        expectedDate="Fevereiro 2025"
        backTo="/admin-v3/agentes/artistas"
        backLabel="Voltar para Artistas"
      />
    </AdminLayout>
  );
}