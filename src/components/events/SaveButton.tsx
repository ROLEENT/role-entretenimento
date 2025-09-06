import * as React from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserAuth } from "@/hooks/useUserAuth";
import { toast } from "@/hooks/use-toast";

export type SaveButtonProps = {
  eventId: string;
  collection?: string;
  onAuthRequired?: () => void;
  className?: string;
  labelSaved?: string;
  labelSave?: string;
};

export function SaveButton({
  eventId,
  collection = "default",
  onAuthRequired,
  className,
  labelSaved = "Salvo",
  labelSave = "Salvar",
}: SaveButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState<boolean>(false);
  const { user } = useUserAuth();

  React.useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      if (!user) {
        if (mounted) setSaved(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("event_saves")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .eq("collection", collection)
        .limit(1)
        .maybeSingle();
        
      if (!mounted) return;
      if (error && error.code !== "PGRST116") {
        console.error("Error checking save status:", error);
      }
      setSaved(!!data);
    }
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [user, eventId, collection]);

  async function toggleSave() {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    try {
      // Optimistic update
      setSaved((s) => !s);
      
      const { data, error } = await supabase.rpc("toggle_save", {
        event_id: eventId,
        collection,
      });
      
      if (error) throw error;
      
      if (typeof data?.[0]?.saved === "boolean") {
        setSaved(data[0].saved);
      }
      
      toast({
        title: saved ? "Evento removido dos salvos" : "Evento salvo!",
        description: saved ? "O evento foi removido da sua lista de salvos." : "O evento foi adicionado à sua lista de salvos."
      });
    } catch (err) {
      console.error("Error toggling save:", err);
      // Rollback optimistic update
      setSaved((s) => !s);
      toast({
        title: "Erro ao salvar evento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      size="sm"
      className={className}
      onClick={toggleSave}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="mr-2 h-4 w-4" />
      ) : (
        <Bookmark className="mr-2 h-4 w-4" />
      )}
      {saved ? labelSaved : labelSave}
    </Button>
  );
}