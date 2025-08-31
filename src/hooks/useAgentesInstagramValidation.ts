import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

interface UseAgentesInstagramValidationOptions {
  instagram: string;
  agentType: 'artist' | 'organizer' | 'venue';
  agentId?: string;
  enabled: boolean;
}

export function useAgentesInstagramValidation({
  instagram,
  agentType,
  agentId,
  enabled,
}: UseAgentesInstagramValidationOptions) {
  const debouncedInstagram = useDebounce(instagram, 500);
  const [instagramStatus, setInstagramStatus] = useState<"available" | "taken" | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!enabled || !debouncedInstagram) {
      setInstagramStatus(null);
      return;
    }

    const validateInstagram = async () => {
      setIsValidating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke("validate-instagram", {
          body: {
            instagram: debouncedInstagram,
            type: agentType,
            excludeId: agentId,
          },
        });

        if (error) {
          console.error("Instagram validation error:", error);
          setInstagramStatus(null);
          return;
        }

        setInstagramStatus(data.isDuplicate ? "taken" : "available");
      } catch (error) {
        console.error("Instagram validation error:", error);
        setInstagramStatus(null);
      } finally {
        setIsValidating(false);
      }
    };

    validateInstagram();
  }, [debouncedInstagram, agentType, agentId, enabled]);

  return {
    isValidatingInstagram: isValidating,
    instagramStatus,
  };
}