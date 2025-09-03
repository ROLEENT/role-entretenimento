import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Calendar, Image, Info } from "lucide-react";

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
  const tabs = [
    {
      id: "visao",
      label: "Visão",
      icon: Eye,
    },
    {
      id: "agenda",
      label: "Agenda",
      icon: Calendar,
      count: eventCount > 0 ? eventCount : undefined,
    },
    {
      id: "midia",
      label: "Mídia",
      icon: Image,
      count: mediaCount > 0 ? mediaCount : undefined,
    },
    {
      id: "sobre",
      label: "Sobre",
      icon: Info,
    },
  ];

  return (
    <div className="mx-auto max-w-screen-sm mt-4 px-4 md:hidden">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-h-[48px] px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 hover:bg-accent/50 active:scale-95 ${
              activeTab === tab.id 
                ? 'border-primary text-foreground bg-accent/30' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-xs opacity-75">
                  ({tab.count})
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}