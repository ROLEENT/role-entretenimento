import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  size = "md",
  className 
}: EmptyStateProps) {
  const sizes = {
    sm: "py-6",
    md: "py-8", 
    lg: "py-12"
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className={cn("text-center", sizes[size])}>
        <Icon className={cn("text-muted-foreground mx-auto mb-4", iconSizes[size])} />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        {action && (
          <Button 
            onClick={action.onClick}
            variant={action.variant || "outline"}
            className="inline-flex items-center gap-2"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}