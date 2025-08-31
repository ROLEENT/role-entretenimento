import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTagInfo, getTagColorClass } from "@/types/curatorial-tags";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  showTooltip?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TagBadge({ tag, showTooltip = true, size = "sm", className }: TagBadgeProps) {
  const tagInfo = getTagInfo(tag);
  
  if (!tagInfo) {
    return (
      <Badge variant="outline" className={cn("opacity-50", className)}>
        {tag}
      </Badge>
    );
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1", 
    lg: "text-base px-3 py-1.5"
  };

  const badge = (
    <Badge 
      variant="outline"
      className={cn(
        getTagColorClass(tagInfo.color),
        sizeClasses[size],
        "gap-1 font-medium border",
        className
      )}
    >
      <span className="text-[1em]" role="img" aria-label={tagInfo.label}>
        {tagInfo.icon}
      </span>
      {tagInfo.label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{tagInfo.label}</p>
            <p className="text-xs opacity-90">{tagInfo.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}