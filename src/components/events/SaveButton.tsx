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
  }, [user, eventId]);

  async function toggleSave() {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        // Remove save
        const { error } = await supabase
          .from("event_saves")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
          
        if (error) throw error;
        setSaved(false);
        toast({
          title: "Evento removido dos salvos",
          description: "O evento foi removido da sua lista de salvos."
        });
      } else {
        // Add save
        const { error } = await supabase
          .from("event_saves")
          .insert({
            event_id: eventId,
            user_id: user.id,
            collection
          });
          
        if (error) throw error;
        setSaved(true);
        toast({
          title: "Evento salvo!",
          description: "O evento foi adicionado à sua lista de salvos."
        });
      }
    } catch (err) {
      console.error("Error toggling save:", err);
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