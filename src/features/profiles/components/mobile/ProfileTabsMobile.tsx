import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Calendar, Image, Info, FileText, Star } from "lucide-react";
import { useMemo, useCallback } from "react";
import { useDebounce } from "use-debounce";

interface ProfileTabsMobileProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  eventCount?: number;
  mediaCount?: number;
}

export function ProfileTabsMobile({ 
  activeTab, 
  onTabChange, 
  eventCount = 0, 
  mediaCount = 0 
}: ProfileTabsMobileProps) {
  // Debounce tab changes for better performance
  const [debouncedActiveTab] = useDebounce(activeTab, 100);
  
  const tabs = useMemo(() => [
    {
      id: "visao-geral",
      label: "Visão",
      icon: Eye,
      ariaLabel: "Ver visão geral do perfil"
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: Calendar,
      count: eventCount > 0 ? eventCount : undefined,
      ariaLabel: `Ver agenda ${eventCount > 0 ? `com ${eventCount} eventos` : ''}`
    },
    {
      id: "conteudos",
      label: "Conteúdos",
      icon: FileText,
      ariaLabel: "Ver conteúdos do perfil"
    },
    {
      id: "fotos-videos",
      label: "Mídia", 
      icon: Image,
      count: mediaCount > 0 ? mediaCount : undefined,
      ariaLabel: `Ver mídia ${mediaCount > 0 ? `com ${mediaCount} itens` : ''}`
    },
    {
      id: "avaliacoes",
      label: "Avaliações",
      icon: Star,
      ariaLabel: "Ver avaliações do perfil"
    },
    {
      id: "sobre",
      label: "Sobre",
      icon: Info,
      ariaLabel: "Ver informações sobre o perfil"
    },
  ], [eventCount, mediaCount]);

  const handleTabChange = useCallback((tabId: string) => {
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    onTabChange(tabId);
  }, [onTabChange]);

  return (
    <div className="mx-auto max-w-screen-sm mt-4 px-4 md:hidden">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabChange(tab.id);
              }
            }}
            aria-label={tab.ariaLabel}
            role="tab"
            aria-selected={debouncedActiveTab === tab.id}
            className={`flex-1 min-h-[56px] px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              debouncedActiveTab === tab.id 
                ? 'border-primary text-primary bg-primary/10' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-xs opacity-75 bg-primary/20 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}