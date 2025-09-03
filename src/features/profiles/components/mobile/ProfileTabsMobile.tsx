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
    <div className="mx-auto max-w-screen-sm mt-4 md:hidden">
      <div className="flex border-b border-white/10 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-[#c77dff] text-foreground' 
                : 'border-transparent text-white/70 hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-xs opacity-75">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}