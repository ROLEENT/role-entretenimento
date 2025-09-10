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
    check: (data: Partial<EventFormData>) => Boolean(data.title && data.title.length >= 3),
    required: true
  },
  {
    id: 'city',
    label: 'Cidade *',
    check: (data: Partial<EventFormData>) => Boolean(data.city),
    required: true
  },
  {
    id: 'date_start',
    label: 'Data de Início *',
    check: (data: Partial<EventFormData>) => Boolean(data.date_start),
    required: true
  },
  {
    id: 'cover_url',
    label: 'Imagem de Capa *',
    check: (data: Partial<EventFormData>) => Boolean(data.cover_url),
    required: true
  },
  {
    id: 'organizer_id',
    label: 'Organizador *',
    check: (data: Partial<EventFormData>) => Boolean(data.organizer_id),
    required: true
  },
  {
    id: 'summary',
    label: 'Resumo *',
    check: (data: Partial<EventFormData>) => Boolean(data.summary && data.summary.length >= 50),
    required: true
  },
  {
    id: 'description',
    label: 'Descrição *',
    check: (data: Partial<EventFormData>) => Boolean(data.description && data.description.length >= 100),
    required: true
  },
  {
    id: 'cover_alt',
    label: 'Alt da Capa *',
    check: (data: Partial<EventFormData>) => Boolean(data.cover_alt && data.cover_alt.length >= 10),
    required: true
  },
  // Optional checks
  {
    id: 'venue_id',
    label: 'Local',
    check: (data: Partial<EventFormData>) => Boolean(data.venue_id || data.location_name),
    required: false
  },
  {
    id: 'seo_title',
    label: 'SEO Título',
    check: (data: Partial<EventFormData>) => Boolean(data.seo_title),
    required: false
  },
  {
    id: 'seo_description',
    label: 'SEO Descrição',
    check: (data: Partial<EventFormData>) => Boolean(data.seo_description),
    required: false
  }
];

export function ChecklistWidget({ eventData, className, onItemClick }: ChecklistWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const requiredChecks = quickChecks.filter(check => check.required);
  const optionalChecks = quickChecks.filter(check => !check.required);
  
  const completedRequiredChecks = requiredChecks.filter(check => check.check(eventData));
  const completedOptionalChecks = optionalChecks.filter(check => check.check(eventData));
  const completedChecks = quickChecks.filter(check => check.check(eventData));
  
  const requiredPercentage = (completedRequiredChecks.length / requiredChecks.length) * 100;
  const completionPercentage = (completedChecks.length / quickChecks.length) * 100;
  const canPublish = completedRequiredChecks.length === requiredChecks.length; // All required items must be completed
  
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
              Checklist ({completedRequiredChecks.length}/{requiredChecks.length} obrigatórios)
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
          <Progress value={requiredPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {Math.round(requiredPercentage)}% obrigatórios • {completedOptionalChecks.length} opcionais
            </span>
            <Badge 
              variant={canPublish ? "default" : "destructive"}
              className="text-xs"
            >
              {canPublish ? "Pronto para Publicar" : "Campos Obrigatórios Pendentes"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Required items */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-destructive">Obrigatórios para Publicação</h4>
              <div className="space-y-1">
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
                        <Circle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-sm">{check.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional items */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Recomendados</h4>
              <div className="space-y-1">
                {optionalChecks.map((check) => {
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
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              {canPublish 
                ? "✅ Pronto para publicar! Todos os campos obrigatórios foram preenchidos"
                : `⚠️ Complete ${requiredChecks.length - completedRequiredChecks.length} campo(s) obrigatório(s) para publicar`
              }
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}