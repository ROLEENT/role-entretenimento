import { Eye, Calendar, Info, Image, MapPin, Clock } from "lucide-react";
import { useMemo, useCallback, useRef } from "react";
import { useDebounce } from "use-debounce";

interface VenueTabsMobileProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  eventCount?: number;
  mediaCount?: number;
}

export function VenueTabsMobile({ 
  activeTab, 
  onTabChange, 
  eventCount = 0,
  mediaCount = 0 
}: VenueTabsMobileProps) {
  // Use ref to prevent unnecessary re-renders during debounce
  const lastClickedTabRef = useRef<string>(activeTab);
  
  // Debounce only for UI updates, not for the actual tab change
  const [debouncedActiveTab] = useDebounce(activeTab, 50);
  
  const tabs = useMemo(() => [
    {
      id: "visao-geral",
      label: "Visão",
      icon: Eye,
      ariaLabel: "Ver visão geral do local"
    },
    {
      id: "eventos",
      label: "Eventos",
      icon: Calendar,
      count: eventCount > 0 ? eventCount : undefined,
      ariaLabel: `Ver eventos ${eventCount > 0 ? `com ${eventCount} eventos` : ''}`
    },
    {
      id: "fotos",
      label: "Fotos",
      icon: Image,
      count: mediaCount > 0 ? mediaCount : undefined,
      ariaLabel: `Ver fotos ${mediaCount > 0 ? `com ${mediaCount} fotos` : ''}`
    },
    {
      id: "horarios",
      label: "Horários",
      icon: Clock,
      ariaLabel: "Ver horários de funcionamento"
    },
    {
      id: "localizacao",
      label: "Local",
      icon: MapPin,
      ariaLabel: "Ver localização no mapa"
    },
    {
      id: "sobre",
      label: "Sobre",
      icon: Info,
      ariaLabel: "Ver informações sobre o local"
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
    <div className="mx-auto max-w-screen-sm mt-4 md:hidden">
      <div className="relative">
        {/* Scroll container */}
        <div 
          className="flex overflow-x-auto scrollbar-hide scroll-smooth border-b border-border pb-0"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x proximity'
          }}
        >
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
              className={`flex-shrink-0 min-w-[88px] min-h-[56px] px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 scroll-snap-start ${
                activeTab === tab.id 
                  ? 'border-primary text-primary bg-primary/10' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <tab.icon className="w-4 h-4" />
                <span className="font-medium text-xs leading-tight">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-xs opacity-75 bg-primary/20 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Gradient indicators for scroll */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
}