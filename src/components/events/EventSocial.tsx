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
  const [avatars, setAvatars] = React.useState<string[]>([]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      
      const { data, error } = await supabase.rpc("get_event_social", {
        p_event_id: eventId,
        p_limit: limit,
      });
      
      if (!active) return;
      
      if (error) {
        console.error("Error loading event social data:", error);
        setLoading(false);
        return;
      }
      
      const row = Array.isArray(data) ? data[0] : data;
      setCounts({
        going: Number(row?.going_count || 0),
        maybe: Number(row?.maybe_count || 0),
        went: Number(row?.went_count || 0),
      });
      setAvatars(Array.isArray(row?.avatars) ? row.avatars : []);
      setLoading(false);
    }
    
    load();
    return () => {
      active = false;
    };
  }, [eventId, limit, refreshKey]);

  return (
    <div className={`w-full ${className || ""}`}>
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
          {avatars.map((src, i) => (
            <Avatar key={i} className="h-7 w-7 ring-2 ring-background">
              <AvatarImage src={src} alt="avatar" />
              <AvatarFallback className="text-[10px]">U{i + 1}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </div>
  );
}