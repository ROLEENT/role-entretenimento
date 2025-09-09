import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Image } from "lucide-react";
import { useProfileStats } from "@/features/profiles/hooks/useProfileStats";
import { Profile } from "@/features/profiles/api";

interface ProfileStatsCardMobileProps {
  profile: Profile;
}

export function ProfileStatsCardMobile({ profile }: ProfileStatsCardMobileProps) {
  const { eventCount, mediaCount, isLoading } = useProfileStats(
    profile.handle || '',
    profile.type,
    profile.user_id || ''
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-muted animate-pulse rounded mb-1" />
                <div className="h-3 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      icon: Users,
      label: "Seguidores",
      value: 0, // TODO: Implementar contagem de seguidores
    },
    {
      icon: Calendar,
      label: "Eventos",
      value: eventCount,
    },
    {
      icon: Image,
      label: "Mídia",
      value: mediaCount,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Estatísticas</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-8 h-8 mx-auto mb-1 rounded-full bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}