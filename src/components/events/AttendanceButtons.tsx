import * as React from "react";
import { Check, HelpCircle, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";
import { toast } from "@/hooks/use-toast";

type Status = "going" | "maybe" | "went" | null;

export type AttendanceButtonsProps = {
  eventId: string;
  showPubliclyDefault?: boolean;
  onAuthRequired?: () => void;
  className?: string;
  onChanged?: (status: Exclude<Status, null>) => void;
};

export function AttendanceButtons({
  eventId,
  showPubliclyDefault = true,
  onAuthRequired,
  className,
  onChanged,
}: AttendanceButtonsProps) {
  const [status, setStatus] = React.useState<Status>(null);
  const [loading, setLoading] = React.useState<string | null>(null);
  const [showPublicly, setShowPublicly] = React.useState<boolean>(showPubliclyDefault);
  const { user } = useUserAuth();

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("event_attendance")
        .select("status, show_publicly")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
        
      if (!mounted) return;
      if (error && error.code !== "PGRST116") {
        console.error("Error loading attendance:", error);
      }
      if (data) {
        setStatus(data.status as Status);
        setShowPublicly(!!data.show_publicly);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user, eventId]);

  async function setAttendance(newStatus: Exclude<Status, null>) {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    try {
      setLoading(newStatus);
      const prev = status;
      setStatus(newStatus);

      const { error } = await supabase
        .from("event_attendance")
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status: newStatus,
          show_publicly: showPublicly
        }, {
          onConflict: "event_id,user_id"
        });

      if (error) throw error;
      
      onChanged?.(newStatus);
      
      const statusLabels = {
        going: "Confirmou presença",
        maybe: "Marcou como talvez",
        went: "Marcou que compareceu"
      };
      
      toast({
        title: statusLabels[newStatus],
        description: "Sua resposta foi salva com sucesso."
      });
    } catch (err) {
      console.error("Error setting attendance:", err);
      setStatus(null); // rollback
      toast({
        title: "Erro ao salvar resposta",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        size="sm"
        variant={status === "going" ? "default" : "outline"}
        disabled={loading !== null}
        onClick={() => setAttendance("going")}
      >
        {loading === "going" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className="mr-2 h-4 w-4" />
        )}
        Vou
      </Button>
      <Button
        size="sm"
        variant={status === "maybe" ? "default" : "outline"}
        disabled={loading !== null}
        onClick={() => setAttendance("maybe")}
      >
        {loading === "maybe" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <HelpCircle className="mr-2 h-4 w-4" />
        )}
        Talvez
      </Button>
      <Button
        size="sm"
        variant={status === "went" ? "default" : "outline"}
        disabled={loading !== null}
        onClick={() => setAttendance("went")}
      >
        {loading === "went" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 h-4 w-4 rotate-180" />
        )}
        Fui
      </Button>
      <label className="ml-3 inline-flex items-center gap-2 text-sm select-none">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border"
          checked={showPublicly}
          onChange={(e) => setShowPublicly(e.target.checked)}
        />
        Mostrar publicamente
      </label>
    </div>
  );
}