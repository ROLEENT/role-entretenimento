import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'conteudos', label: 'Conteúdos' },
  { id: 'fotos-videos', label: 'Fotos e vídeos' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'sobre', label: 'Sobre' },
];

export function ProfileNav({ activeTab = 'sobre', onTabChange }: ProfileNavProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLUListElement>(null);

  const handleTabClick = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
    
    // Scroll active tab into view on mobile
    if (scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector(`[data-tab="${tabId}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, []);

  const currentTab = onTabChange ? activeTab : internalActiveTab;

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
      <div className="container mx-auto relative">
        {/* Mobile scroll indicators */}
        <div className="md:hidden absolute left-0 top-0 bottom-0 z-10 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-full rounded-none px-2 transition-opacity",
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="md:hidden absolute right-0 top-0 bottom-0 z-10 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-full rounded-none px-2 transition-opacity",
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <ul 
          ref={scrollContainerRef}
          className={cn(
            "flex gap-1 md:gap-5 text-sm overflow-x-auto scrollbar-hide scroll-smooth",
            "px-3 md:px-0",
            "md:justify-start snap-x snap-mandatory"
          )}
        >
          {tabs.map((tab) => (
            <li key={tab.id} className="snap-center">
              <button
                data-tab={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "py-3 px-4 md:px-0 inline-block whitespace-nowrap transition-all duration-200",
                  "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "min-w-0 flex-shrink-0",
                  "active:scale-95 md:active:scale-100",
                  currentTab === tab.id
                    ? "text-primary border-b-2 border-primary font-medium md:font-normal"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={currentTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile gradient overlays for scroll indication */}
        <div className={cn(
          "md:hidden absolute left-0 top-0 bottom-0 w-8 pointer-events-none",
          "bg-gradient-to-r from-background/80 to-transparent",
          "transition-opacity",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )} />
        
        <div className={cn(
          "md:hidden absolute right-0 top-0 bottom-0 w-8 pointer-events-none", 
          "bg-gradient-to-l from-background/80 to-transparent",
          "transition-opacity",
          canScrollRight ? "opacity-100" : "opacity-0"
        )} />
      </div>
    </nav>
  );
}