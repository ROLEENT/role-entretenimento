import { UnderConstructionPage } from "@/components/common/UnderConstructionPage";

export default function RevistaPage() {
  return (
    <UnderConstructionPage
      title="Revista Digital"
      description="Sistema de publicação de matérias, entrevistas e conteúdo editorial."
      expectedDate="Abril 2025"
      backTo="/admin-v3/agenda"
      backLabel="Voltar para Agenda"
    />
  );
}