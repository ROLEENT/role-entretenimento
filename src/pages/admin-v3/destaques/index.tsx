import { AdminLayout } from "@/components/admin/AdminLayout";
import { UnderConstructionPage } from "@/components/common/UnderConstructionPage";

export default function DestaquesPage() {
  return (
    <AdminLayout>
      <UnderConstructionPage
        title="Destaques Editoriais"
        description="Curadoria de conteúdo, vitrine cultural e gerenciamento de banners."
        expectedDate="Maio 2025"
        backTo="/admin-v3/agenda"
        backLabel="Voltar para Agenda"
      />
    </AdminLayout>
  );
}