import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Minus, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CriterionKey = 'relevancia' | 'qualidade' | 'diversidade' | 'impacto' | 'coerencia' | 'experiencia' | 'tecnica' | 'acessibilidade';
export type CriterionStatus = 'met' | 'partial' | 'na';

interface CriterionData {
  key: CriterionKey;
  status: CriterionStatus;
  is_primary: boolean;
}

interface CurationCriteriaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteria: CriterionData[];
  notes?: string;
  eventTitle?: string;
}

const CRITERIA_CONFIG: Record<CriterionKey, { label: string; description: string }> = {
  relevancia: {
    label: 'Relevância Cultural',
    description: 'Diálogo real com a cena da cidade'
  },
  qualidade: {
    label: 'Qualidade Artística',
    description: 'Entrega consistente do line-up e proposta'
  },
  diversidade: {
    label: 'Diversidade e Inclusão',
    description: 'Representatividade no palco e na pista'
  },
  impacto: {
    label: 'Impacto Local',
    description: 'Contribuição para a comunidade e circulação'
  },
  coerencia: {
    label: 'Coerência Curatorial',
    description: 'Conceito, narrativa e execução alinhados'
  },
  experiencia: {
    label: 'Experiência do Público',
    description: 'Cuidado com acolhimento e fluidez'
  },
  tecnica: {
    label: 'Técnica e Produção',
    description: 'Som, luz, segurança e operação'
  },
  acessibilidade: {
    label: 'Acessibilidade',
    description: 'Informações claras, estrutura e preço justo'
  }
};

const STATUS_CONFIG = {
  met: { icon: Check, label: 'Atende', className: 'text-green-600 bg-green-50' },
  partial: { icon: Minus, label: 'Parcial', className: 'text-yellow-600 bg-yellow-50' },
  na: { icon: X, label: 'Não se aplica', className: 'text-gray-500 bg-gray-50' }
};

function CriterionItem({ criterionKey, status, isPrimary }: { criterionKey: CriterionKey; status: CriterionStatus; isPrimary: boolean }) {
  const config = CRITERIA_CONFIG[criterionKey];
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      isPrimary ? 'border-primary bg-primary/5' : 'border-border'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-foreground">{config.label}</h4>
            {isPrimary && (
              <Badge variant="secondary" className="text-xs">Destaque</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
          statusConfig.className
        )}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </div>
      </div>
    </div>
  );
}

export function CurationCriteriaDrawer({ 
  open, 
  onOpenChange, 
  criteria, 
  notes, 
  eventTitle 
}: CurationCriteriaDrawerProps) {
  const score = criteria.reduce((acc, c) => {
    if (c.status === 'met') return acc + 1;
    if (c.status === 'partial') return acc + 0.5;
    return acc;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-semibold">
            Como escolhemos este destaque
          </DialogTitle>
          {eventTitle && (
            <p className="text-sm text-muted-foreground">
              Critérios de curadoria para <span className="font-medium">{eventTitle}</span>
            </p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="font-medium">
              {score} de 8 critérios atendidos
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.keys(CRITERIA_CONFIG).map((key) => {
              const criterionKey = key as CriterionKey;
              const criterion = criteria.find(c => c.key === criterionKey);
              const status = criterion?.status || 'na';
              const isPrimary = criterion?.is_primary || false;

              return (
                <CriterionItem
                  key={criterionKey}
                  criterionKey={criterionKey}
                  status={status}
                  isPrimary={isPrimary}
                />
              );
            })}
          </div>

          {notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Notas da Curadoria</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {notes}
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button variant="outline" asChild className="w-full">
              <a 
                href="/politicas/curadoria" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <span>Entenda nossa política de curadoria</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}