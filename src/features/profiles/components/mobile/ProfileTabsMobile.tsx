import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Calendar, Image, Info, FileText, Star } from "lucide-react";
import { useMemo, useCallback, useRef } from "react";
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
  // Use ref to prevent unnecessary re-renders during debounce
  const lastClickedTabRef = useRef<string>(activeTab);
  
  // Debounce only for UI updates, not for the actual tab change
  const [debouncedActiveTab] = useDebounce(activeTab, 50);
  
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

  // Immediate tab change with debounced UI feedback
  const handleTabChange = useCallback((tabId: string) => {
    // Prevent duplicate calls
    if (lastClickedTabRef.current === tabId) {
      return;
    }
    
    lastClickedTabRef.current = tabId;
    
    // Immediate change for better UX
    onTabChange(tabId);
    
    // Haptic feedback for mobile (non-blocking)
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        // Silently fail for unsupported devices
      }
    }
  }, [onTabChange]);

  return (
    <div className="mx-auto max-w-screen-sm mt-6 px-4 md:hidden sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex">
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
            aria-selected={activeTab === tab.id}
            className={`flex-1 min-h-[56px] px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              activeTab === tab.id 
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