export const MENUS = {
  agenda: [
    { href: "/admin-v3/agenda", title: "Todos eventos", description: "lista geral" },
    { href: "/admin-v3/agenda?status=draft", title: "Rascunhos", description: "aguardando publicação" },
    { href: "/admin-v3/agenda?status=scheduled", title: "Agendados", description: "eventos futuros" },
    { href: "/admin-v3/agenda?status=published", title: "Publicados", description: "no ar" },
    { href: "/admin-v3/agenda/new", title: "Criar evento", description: "novo cadastro" },
  ],
  agentes: [
    { href: "/admin-v3/agentes/artistas", title: "Artistas", description: "listagem" },
    { href: "/admin-v3/agentes/organizadores", title: "Organizadores", description: "listagem" },
    { href: "/admin-v3/agentes/locais", title: "Locais", description: "listagem" },
    { href: "/admin-v3/agentes/artistas/new", title: "Novo artista", description: "cadastro" },
    { href: "/admin-v3/agentes/organizadores/new", title: "Novo organizador", description: "cadastro" },
    { href: "/admin-v3/agentes/locais/new", title: "Novo local", description: "cadastro" },
  ],
  revista: [
    { href: "/admin-v3/revista", title: "Matérias", description: "listagem" },
    { href: "/admin-v3/revista/pautas", title: "Pautas", description: "planejamento" },
    { href: "/admin-v3/revista/colunas", title: "Colunas", description: "seções" },
    { href: "/admin-v3/revista/autores", title: "Autores", description: "time" },
    { href: "/admin-v3/revista/new", title: "Nova matéria", description: "cadastro" },
  ],
  gestao: [
    { href: "/admin-v3/gestao/usuarios", title: "Usuários", description: "acessos" },
    { href: "/admin-v3/gestao/artist-types", title: "Tipos de artista", description: "taxonomia" },
    { href: "/admin-v3/gestao/generos", title: "Gêneros", description: "taxonomia" },
    { href: "/admin-v3/gestao/cidades", title: "Cidades", description: "referência" },
    { href: "/admin-v3/gestao/config", title: "Configurações", description: "geral" },
    { href: "/admin-v3/gestao/logs", title: "Logs", description: "auditoria" },
  ],
  destaques: [
    { href: "/admin-v3/destaques/curadoria", title: "Curadoria", description: "editorial" },
    { href: "/admin-v3/destaques/vitrine", title: "Vitrine cultural", description: "capa" },
    { href: "/admin-v3/destaques/banners", title: "Banners", description: "arte" },
    { href: "/admin-v3/destaques/pins", title: "Fixados", description: "prioridade" },
  ],
} as const;