import { MegaMenu } from "@/components/admin/MegaMenu";
import { MENUS } from "@/components/admin/menu.config";

export function AdminTopNav() {
  return (
    <nav className="flex items-center gap-2 overflow-visible">
      <MegaMenu label="Agenda" items={MENUS.agenda} />
      <MegaMenu label="Agentes" items={MENUS.agentes} />
      <MegaMenu label="Revista" items={MENUS.revista} />
      <MegaMenu label="Gestão" items={MENUS.gestao} />
      <MegaMenu label="Destaques" items={MENUS.destaques} />
    </nav>
  );
}