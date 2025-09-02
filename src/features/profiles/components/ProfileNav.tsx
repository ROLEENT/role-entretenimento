import { useState } from "react";
import { cn } from "@/lib/utils";

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

  const handleTabClick = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const currentTab = onTabChange ? activeTab : internalActiveTab;

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
      <ul className="container mx-auto flex gap-5 px-3 md:px-0 text-sm overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "py-3 inline-block whitespace-nowrap transition-colors",
                "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                currentTab === tab.id
                  ? "text-[hsl(280_100%_70%)] border-b-2 border-[hsl(280_100%_70%)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={currentTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}