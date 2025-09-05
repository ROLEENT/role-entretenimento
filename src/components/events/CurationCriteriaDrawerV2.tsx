import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Minus, X, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  met: { icon: Check, label: 'Atende', className: 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800' },
  partial: { icon: Minus, label: 'Parcial', className: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800' },
  na: { icon: X, label: 'Não se aplica', className: 'text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800' }
};

// Custom hooks
function useDrawerKeyboard(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}

function useDrawerHistory(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    
    const handlePopState = () => {
      onClose();
    };
    
    // Push a fake state when drawer opens
    window.history.pushState({ drawerOpen: true }, '');
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Remove the fake state when drawer closes
      if (window.history.state?.drawerOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);
}

function useDrawerBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
}

function useFocusTrap(isOpen: boolean, containerRef: React.RefObject<HTMLElement>) {
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    
    // Store the last focused element
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    
    // Focus the container
    const firstFocusable = containerRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Trap focus within container
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = containerRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the last focused element
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, containerRef]);
}

function CriterionAccordionItem({ 
  criterionKey, 
  status, 
  isPrimary 
}: { 
  criterionKey: CriterionKey; 
  status: CriterionStatus; 
  isPrimary: boolean 
}) {
  const config = CRITERIA_CONFIG[criterionKey];
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  return (
    <AccordionItem 
      value={criterionKey} 
      className="rounded-xl border border-white/10 px-3 mb-2 data-[state=open]:bg-white/5"
    >
      <AccordionTrigger className="hover:no-underline py-3 [&[data-state=open]>svg]:rotate-90">
        <div className="flex items-center justify-between w-full mr-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-left">{config.label}</span>
            {isPrimary && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">Destaque</Badge>
            )}
          </div>
          <div className={cn(
            'flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border',
            statusConfig.className
          )}>
            <StatusIcon className="h-3 w-3" />
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-3 pt-1">
        <p className="text-sm text-muted-foreground">
          {config.description}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

export function CurationCriteriaDrawer({
  open,
  onOpenChange,
  criteria,
  notes,
  eventTitle
}: CurationCriteriaDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom hooks
  useDrawerKeyboard(open, () => onOpenChange(false));
  useDrawerHistory(open, () => onOpenChange(false));
  useDrawerBodyScroll(open);
  useFocusTrap(open, drawerRef);

  // Calculate score
  const metCriteria = criteria.filter(c => c.status === 'met').length;
  const totalCriteria = criteria.length;
  
  // Get primary criteria for initial accordion state
  const primaryCriteria = criteria.filter(c => c.is_primary).slice(0, 3);
  const defaultOpenValues = primaryCriteria.map(c => c.key);

  // Touch/mouse handlers for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = currentY - startY;
    if (deltaY > 100) { // Swipe down threshold
      onOpenChange(false);
    }
    
    setStartY(0);
    setCurrentY(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm drawer-backdrop entering"
      onClick={handleBackdropClick}
    >
      <div
        ref={drawerRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-[#1a1a1a] text-white drawer-container mobile open",
          "md:fixed md:inset-0 md:flex md:items-center md:justify-center"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        {/* Mobile Swipe Indicator */}
        <div className="md:hidden absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full" />
        
        {/* Desktop Container */}
        <div className="md:bg-[#1a1a1a] md:rounded-xl md:max-w-2xl md:w-full md:max-h-[80vh] md:m-4 md:flex md:flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 drawer-header">
            <div>
              <h2 id="drawer-title" className="text-lg md:text-xl font-semibold">
                Como escolhemos este destaque?
              </h2>
              {eventTitle && (
                <p className="text-sm text-white/70 mt-1">{eventTitle}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 drawer-content">
            {/* Score Summary */}
            <div className="mb-6 p-4 bg-[#c77dff]/10 border border-[#c77dff]/20 rounded-xl">
              <h3 className="font-semibold text-[#c77dff] mb-2">Pontuação Curatorial</h3>
              <p className="text-sm text-white/80">
                <span className="font-medium text-white">{metCriteria} de {totalCriteria} critérios atendidos</span>
                <br />
                Este evento se qualifica como destaque curatorial por sua relevância cultural e qualidade artística.
              </p>
            </div>

            {/* Criteria List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white mb-4">Critérios de Avaliação</h3>
              <Accordion 
                type="multiple" 
                defaultValue={defaultOpenValues}
                className="drawer-accordion"
              >
                {criteria.map((criterion) => (
                  <CriterionAccordionItem
                    key={criterion.key}
                    criterionKey={criterion.key}
                    status={criterion.status}
                    isPrimary={criterion.is_primary}
                  />
                ))}
              </Accordion>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                <h4 className="font-medium text-white mb-2">Notas da Curadoria</h4>
                <p className="text-sm text-white/80">{notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 md:p-6 drawer-footer">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-[#c77dff] hover:bg-[#c77dff]/90 text-white"
              >
                Entendi
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <a 
                  href="/sobre/politica-curatorial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Política Curatorial
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}