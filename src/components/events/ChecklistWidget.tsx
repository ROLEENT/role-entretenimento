import { useState } from "react";
import { CheckCircle, Circle, ChevronUp, ChevronDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EventFormData } from "@/schemas/eventSchema";
import { canPublish, getPublicationRequirements } from "@/utils/canPublish";

interface ChecklistWidgetProps {
  eventData: Partial<EventFormData>;
  className?: string;
  onItemClick?: (itemId: string) => void;
}

const quickChecks = [
  {
    id: 'title',
    label: 'Título',
    check: (data: Partial<EventFormData>) => Boolean(data.title && data.title.length >= 3),
    required: true
  },
  {
    id: 'slug',
    label: 'Slug único',
    check: (data: Partial<EventFormData>) => Boolean(data.slug),
    required: true
  },
  {
    id: 'city',
    label: 'Cidade',
    check: (data: Partial<EventFormData>) => Boolean(data.city),
    required: true
  },
  {
    id: 'date_start',
    label: 'Data de início',
    check: (data: Partial<EventFormData>) => Boolean(data.date_start),
    required: true
  },
  {
    id: 'date_end',
    label: 'Data de fim',
    check: (data: Partial<EventFormData>) => Boolean(data.date_end),
    required: true
  },
  {
    id: 'cover',
    label: 'Capa',
    check: (data: Partial<EventFormData>) => Boolean(data.cover_url || data.image_url),
    required: true
  },
  {
    id: 'cover_alt',
    label: 'Texto alt. da capa',
    check: (data: Partial<EventFormData>) => Boolean(data.cover_alt),
    required: true
  },
  {
    id: 'location_name',
    label: 'Local',
    check: (data: Partial<EventFormData>) => Boolean(data.location_name),
    required: false
  },
  {
    id: 'summary',
    label: 'Resumo',
    check: (data: Partial<EventFormData>) => Boolean(data.summary && data.summary.length >= 20),
    required: false
  }
];

export function ChecklistWidget({ eventData, className, onItemClick }: ChecklistWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completedChecks = quickChecks.filter(check => check.check(eventData));
  const requiredChecks = quickChecks.filter(check => check.required);
  const completedRequiredChecks = requiredChecks.filter(check => check.check(eventData));
  const completionPercentage = (completedChecks.length / quickChecks.length) * 100;
  const canAutoPublish = canPublish(eventData);
  const missingRequirements = getPublicationRequirements(eventData);
  
  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };

  return (
    <Card className={cn("sticky top-4", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canAutoPublish ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="font-medium text-sm">
              Publicação ({completedRequiredChecks.length}/{requiredChecks.length})
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
              variant={canAutoPublish ? "default" : "secondary"}
              className="text-xs"
            >
              {canAutoPublish ? "Publicará" : "Rascunho"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Required items */}
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-medium text-muted-foreground">Obrigatórios para publicar</h4>
            {requiredChecks.map((check) => {
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

          {/* Optional items */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Recomendados</h4>
            {quickChecks.filter(check => !check.required).map((check) => {
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
            {canAutoPublish ? (
              <p className="text-xs text-green-600 text-center font-medium">
                ✓ Será publicado automaticamente
              </p>
            ) : (
              <div className="text-xs text-muted-foreground">
                <p className="text-center mb-2">Pendências para publicar:</p>
                <ul className="space-y-1">
                  {missingRequirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <Circle className="h-2 w-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                  {missingRequirements.length > 3 && (
                    <li className="text-center">
                      ... e mais {missingRequirements.length - 3}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}