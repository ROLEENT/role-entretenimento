import { AdminLayout } from "@/components/admin/AdminLayout";
import { UnderConstructionPage } from "@/components/common/UnderConstructionPage";

export default function GestaoPage() {
  return (
    <AdminLayout>
      <UnderConstructionPage
        title="Gestão do Sistema"
        description="Configurações, usuários, taxonomias e ferramentas administrativas."
        expectedDate="Janeiro 2025"
        backTo="/admin-v3/agenda"
        backLabel="Voltar para Agenda"
      />
    </AdminLayout>
  );
}