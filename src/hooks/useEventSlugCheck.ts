import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

interface UseEventSlugCheckOptions {
  slug: string;
  eventId?: string;
  enabled: boolean;
}

export function useEventSlugCheck({
  slug,
  eventId,
  enabled,
}: UseEventSlugCheckOptions) {
  const debouncedSlug = useDebounce(slug, 500);
  const [slugStatus, setSlugStatus] = useState<"available" | "taken" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["event-slug-check", debouncedSlug, eventId],
    queryFn: async () => {
      if (!debouncedSlug) return null;

      let query = supabase
        .from("agenda_itens")
        .select("id")
        .eq("slug", debouncedSlug);

      // Excluir o registro atual se estiver editando
      if (eventId) {
        query = query.neq("id", eventId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    },
    enabled: enabled && !!debouncedSlug,
  });

  useEffect(() => {
    if (!enabled || !debouncedSlug) {
      setSlugStatus(null);
      return;
    }

    if (data !== undefined) {
      setSlugStatus(data.length > 0 ? "taken" : "available");
    }
  }, [data, enabled, debouncedSlug]);

  return {
    isCheckingSlug: isLoading && enabled && !!debouncedSlug,
    slugStatus,
  };
}