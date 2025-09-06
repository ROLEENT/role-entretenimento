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
import { useDragScroll } from "@/hooks/useDragScroll";
import { useRef, useCallback, useEffect, useState } from "react";

interface ProfileNavNewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileNavNew({ activeTab, onTabChange }: ProfileNavNewProps) {
  const navRef = useRef<HTMLElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  useDragScroll(navRef);

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

  const updateScrollIndicators = useCallback(() => {
    const element = navRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setShowLeftGradient(scrollLeft > 0);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  const handleTabClick = useCallback((tabId: string) => {
    onTabChange(tabId);
    
    // Scroll ativo para o centro no mobile
    if (window.innerWidth < 768) {
      const element = navRef.current;
      const activeButton = element?.querySelector(`[data-tab="${tabId}"]`) as HTMLElement;
      
      if (element && activeButton) {
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;
        const containerWidth = element.clientWidth;
        const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        element.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [onTabChange]);

  useEffect(() => {
    const element = navRef.current;
    if (!element) return;

    updateScrollIndicators();
    element.addEventListener('scroll', updateScrollIndicators);
    window.addEventListener('resize', updateScrollIndicators);

    return () => {
      element.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
    };
  }, [updateScrollIndicators]);

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-3 md:px-0 relative">
        {/* Gradientes de indicação de scroll */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background/95 to-transparent z-10 pointer-events-none transition-opacity duration-200 md:hidden",
            showLeftGradient ? "opacity-100" : "opacity-0"
          )} 
        />
        <div 
          className={cn(
            "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/95 to-transparent z-10 pointer-events-none transition-opacity duration-200 md:hidden",
            showRightGradient ? "opacity-100" : "opacity-0"
          )} 
        />
        
        <nav 
          ref={navRef}
          className={cn(
            "flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide scroll-smooth",
            "touch-pan-x select-none cursor-grab active:cursor-grabbing",
            "-webkit-overflow-scrolling: touch"
          )}
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x proximity'
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                data-tab={tab.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap transition-all duration-200 flex-shrink-0",
                  "scroll-snap-start touch-target",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
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