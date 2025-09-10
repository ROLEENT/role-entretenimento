import { cn } from "@/lib/utils";
import { Calendar, FileText, Camera, Star, Info } from "lucide-react";

interface ProfileNavNewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileNavNew({ activeTab, onTabChange }: ProfileNavNewProps) {
  const tabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Info },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'conteudos', label: 'Conteúdos', icon: FileText },
    { id: 'fotos-videos', label: 'Fotos & Vídeos', icon: Camera },
    { id: 'avaliacoes', label: 'Avaliações', icon: Star },
    { id: 'sobre', label: 'Sobre', icon: Info },
  ];

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto px-3 md:px-0">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}