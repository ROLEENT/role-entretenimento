import { AdminLayout } from "@/components/admin/AdminLayout";
import { UnderConstructionPage } from "@/components/common/UnderConstructionPage";

export default function VenuesPage() {
  return (
    <AdminLayout>
      <UnderConstructionPage
        title="Locais (Venues)"
        description="Gestão de casas de show, bares, clubes e espaços culturais."
        expectedDate="Março 2025"
        backTo="/admin-v3/agentes/artistas"
        backLabel="Voltar para Artistas"
      />
    </AdminLayout>
  );
}