import * as React from "react";
import { Users, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export type EventSocialProps = {
  eventId: string;
  limit?: number;
  className?: string;
  refreshKey?: number;
};

export function EventSocial({ 
  eventId, 
  limit = 12, 
  className, 
  refreshKey = 0 
}: EventSocialProps) {
  const [loading, setLoading] = React.useState(true);
  const [counts, setCounts] = React.useState<{ 
    going: number; 
    maybe: number; 
    went: number; 
  }>({ going: 0, maybe: 0, went: 0 });
  const [avatars, setAvatars] = React.useState<Array<{
    user_id: string;
  }>>([]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        // Get counts for each status
        const { data: countData, error: countError } = await supabase
          .from("event_attendance")
          .select("status")
          .eq("event_id", eventId);

        if (countError) throw countError;

        const statusCounts = countData.reduce((acc, curr) => {
          acc[curr.status as keyof typeof acc] = (acc[curr.status as keyof typeof acc] || 0) + 1;
          return acc;
        }, { going: 0, maybe: 0, went: 0 });

        // Get user IDs from users who are going publicly
        const { data: avatarData, error: avatarError } = await supabase
          .from("event_attendance")
          .select("user_id")
          .eq("event_id", eventId)
          .eq("show_publicly", true)
          .in("status", ["going", "maybe"])
          .limit(limit);

        if (!active) return;

        if (avatarError) {
          console.error("Error loading avatars:", avatarError);
        }

        setCounts(statusCounts);
        setAvatars(avatarData?.map(item => ({
          user_id: item.user_id
        })) || []);
        
      } catch (error) {
        console.error("Error loading event social data:", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    
    load();
    return () => {
      active = false;
    };
  }, [eventId, limit, refreshKey]);

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3 text-sm">
        <Users className="h-4 w-4" />
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Carregando
          </span>
        ) : (
          <span>
            {counts.going} vão, {counts.maybe} talvez, {counts.went} já foram
          </span>
        )}
      </div>
      {!loading && avatars.length > 0 && (
        <div className="mt-2 flex -space-x-2 overflow-hidden">
          {avatars.map((user, i) => (
            <Avatar key={user.user_id} className="h-7 w-7 ring-2 ring-background">
              <AvatarImage src={undefined} alt="avatar" />
              <AvatarFallback className="text-[10px]">
                {getInitials(user.user_id)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </div>
  );
}