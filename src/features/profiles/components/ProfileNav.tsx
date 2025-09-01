import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'portfolio', label: 'Portfólio' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'avaliacoes', label: 'Avaliações' },
];

export function ProfileNav({ activeTab = 'sobre', onTabChange }: ProfileNavProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);

  const handleTabClick = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const currentTab = onTabChange ? activeTab : internalActiveTab;

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors",
                "hover:text-foreground border-b-2 border-transparent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                currentTab === tab.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {currentTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all duration-200" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}