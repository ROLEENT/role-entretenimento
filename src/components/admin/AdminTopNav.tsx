import { MegaMenu } from "@/components/admin/MegaMenu";
import { MENUS } from "@/components/admin/menu.config";

export function AdminTopNav() {
  return (
    <nav className="flex items-center gap-2 overflow-visible">
      <MegaMenu label="Agenda" items={MENUS.agenda} basePath="/admin-v3/agenda" />
      <MegaMenu label="Agentes" items={MENUS.agentes} basePath="/admin-v3/agentes" />
      <MegaMenu label="Revista" items={MENUS.revista} basePath="/admin-v3/revista" />
      <MegaMenu label="Gestão" items={MENUS.gestao} basePath="/admin-v3/gestao" />
      <MegaMenu label="Destaques" items={MENUS.destaques} basePath="/admin-v3/destaques" />
    </nav>
  );
}