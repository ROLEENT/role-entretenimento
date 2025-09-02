import { Button } from "@/components/ui/button";
import { 
  EyeIcon, 
  CalendarIcon, 
  FileTextIcon, 
  ImageIcon, 
  StarIcon, 
  InfoIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileNavNewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileNavNew({ activeTab, onTabChange }: ProfileNavNewProps) {
  const tabs = [
    {
      id: "visao-geral",
      label: "Visão geral",
      icon: EyeIcon,
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: CalendarIcon,
    },
    {
      id: "conteudos",
      label: "Conteúdos",
      icon: FileTextIcon,
    },
    {
      id: "fotos-videos",
      label: "Fotos e vídeos",
      icon: ImageIcon,
    },
    {
      id: "avaliacoes",
      label: "Avaliações",
      icon: StarIcon,
    },
    {
      id: "sobre",
      label: "Sobre",
      icon: InfoIcon,
    },
  ];

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-3 md:px-0">
        <nav className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap transition-all duration-200",
                  isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}