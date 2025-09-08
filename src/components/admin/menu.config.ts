import { Calendar, Plus, Users, Building2, MapPin, UserPlus, BookOpen, Settings, Star, Activity, Bell, BarChart3, Database, FileText, User } from "lucide-react";

export const MENUS = {
  agenda: [
    { 
      href: "/admin-v3/agenda", 
      title: "Todos eventos", 
      description: "lista completa",
      icon: Calendar
    },
  ],
  perfis: [
    { 
      href: "/admin-v3/agentes/artistas", 
      title: "Artistas", 
      description: "listagem",
      icon: Users
    },
    { 
      href: "/admin-v3/agentes/organizadores", 
      title: "Organizadores", 
      description: "listagem",
      icon: Building2
    },
    { 
      href: "/admin-v3/agentes/venues", 
      title: "Locais", 
      description: "em desenvolvimento",
      icon: MapPin
    },
    { 
      href: "/admin-v3/agentes/artistas/criar", 
      title: "Novo artista", 
      description: "cadastro",
      icon: UserPlus
    },
    { 
      href: "/admin-v3/agentes/organizadores/create-v2", 
      title: "Novo organizador", 
      description: "cadastro",
      icon: UserPlus
    },
  ],
  revista: [
    { 
      href: "/admin-v3/revista", 
      title: "Revista", 
      description: "em desenvolvimento",
      icon: BookOpen
    },
  ],
  gestao: [
    { 
      href: "/admin-v3/gestao", 
      title: "Visão Geral", 
      description: "dashboard principal",
      icon: Settings
    },
    { 
      href: "/admin-v3/gestao/logs", 
      title: "Logs do Sistema", 
      description: "auditoria",
      icon: Activity
    },
    { 
      href: "/admin-v3/gestao/notificacoes", 
      title: "Notificações Push", 
      description: "admin alerts",
      icon: Bell
    },
    { 
      href: "/admin-v3/gestao/analytics", 
      title: "Analytics", 
      description: "relatórios",
      icon: BarChart3
    },
    { 
      href: "/admin-v3/gestao/performance", 
      title: "Performance", 
      description: "monitoramento",
      icon: Activity
    },
    { 
      href: "/admin-v3/gestao/backup", 
      title: "Backup/Restore", 
      description: "dados",
      icon: Database
    },
    { 
      href: "/admin-v3/gestao/security", 
      title: "Segurança", 
      description: "compliance",
      icon: User
    },
  ],
  destaques: [
    { 
      href: "/admin-v3/destaques", 
      title: "Destaques", 
      description: "em desenvolvimento",
      icon: Star
    },
  ],
} as const;