export const MENUS = {
  agenda: [
    { href: "/admin-v3/agenda", title: "Todos eventos", description: "lista completa" },
    { href: "/admin-v3/agenda/criar", title: "Criar evento", description: "novo cadastro" },
  ],
  agentes: [
    { href: "/admin-v3/agentes/artistas", title: "Artistas", description: "listagem" },
    { href: "/admin-v3/agentes/organizadores", title: "Organizadores", description: "em desenvolvimento" },
    { href: "/admin-v3/agentes/venues", title: "Locais", description: "em desenvolvimento" },
    { href: "/admin-v3/agentes/artistas/criar", title: "Novo artista", description: "cadastro" },
  ],
  revista: [
    { href: "/admin-v3/revista", title: "Revista", description: "em desenvolvimento" },
  ],
  gestao: [
    { href: "/admin-v3/gestao", title: "Gestão", description: "em desenvolvimento" },
  ],
  destaques: [
    { href: "/admin-v3/destaques", title: "Destaques", description: "em desenvolvimento" },
  ],
} as const;