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
    <div className="px-4 py-3 md:hidden border-b">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col gap-1 py-2 text-xs data-[state=active]:bg-[#c77dff] data-[state=active]:text-black font-medium transition-all min-h-[44px]"
              >
                <Icon className="w-4 h-4" />
                <span className="leading-tight">
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 text-[10px] opacity-75">
                      ({tab.count})
                    </span>
                  )}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}