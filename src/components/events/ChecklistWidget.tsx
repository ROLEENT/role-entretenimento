import { useState } from "react";
import { CheckCircle, Circle, ChevronUp, ChevronDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EventFormData } from "@/schemas/eventSchema";

interface ChecklistWidgetProps {
  eventData: Partial<EventFormData>;
  className?: string;
  onItemClick?: (itemId: string) => void;
}

const quickChecks = [
  {
    id: 'title',
    label: 'Título',
    check: (data: Partial<EventFormData>) => Boolean(data.title && data.title.length >= 3)
  },
  {
    id: 'date_start',
    label: 'Data',
    check: (data: Partial<EventFormData>) => Boolean(data.date_start)
  },
  {
    id: 'city',
    label: 'Cidade',
    check: (data: Partial<EventFormData>) => Boolean(data.city)
  },
  {
    id: 'location_name',
    label: 'Local',
    check: (data: Partial<EventFormData>) => Boolean(data.location_name)
  },
  {
    id: 'summary',
    label: 'Resumo',
    check: (data: Partial<EventFormData>) => Boolean(data.summary && data.summary.length >= 20)
  },
  {
    id: 'image_url',
    label: 'Imagem',
    check: (data: Partial<EventFormData>) => Boolean(data.image_url)
  }
];

export function ChecklistWidget({ eventData, className, onItemClick }: ChecklistWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completedChecks = quickChecks.filter(check => check.check(eventData));
  const completionPercentage = (completedChecks.length / quickChecks.length) * 100;
  const canPublish = completedChecks.length >= 4; // Minimum required items
  
  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canPublish ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="font-medium text-sm">
              Quick Check ({completedChecks.length}/{quickChecks.length})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {Math.round(completionPercentage)}% completo
            </span>
            <Badge 
              variant={canPublish ? "default" : "secondary"}
              className="text-xs"
            >
              {canPublish ? "Pronto" : "Pendente"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {quickChecks.map((check) => {
              const isCompleted = check.check(eventData);
              return (
                <button
                  key={check.id}
                  onClick={() => handleItemClick(check.id)}
                  className={cn(
                    "flex items-center gap-2 w-full p-2 rounded-md text-left transition-colors",
                    "hover:bg-muted/50",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm">{check.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {canPublish 
                ? "Todos os itens essenciais foram preenchidos"
                : "Complete os itens para poder publicar"
              }
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}