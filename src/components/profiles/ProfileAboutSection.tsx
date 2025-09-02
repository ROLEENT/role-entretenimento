import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileAboutSectionProps {
  bio: string;
  maxLines?: number;
}

export function ProfileAboutSection({ bio, maxLines = 4 }: ProfileAboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!bio) return null;

  const shouldShowToggle = bio.length > 200; // Aproximadamente 4 linhas

  return (
    <div className="space-y-3">
      <div 
        className={cn(
          "text-sm leading-6 text-muted-foreground",
          !isExpanded && shouldShowToggle && `line-clamp-${maxLines}`
        )}
      >
        {bio.split('\n').map((paragraph, index) => (
          <p key={index} className={index > 0 ? "mt-4" : ""}>
            {paragraph}
          </p>
        ))}
      </div>
      
      {shouldShowToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
        >
          {isExpanded ? 'ver menos' : 'ver mais'}
        </Button>
      )}
    </div>
  );
}