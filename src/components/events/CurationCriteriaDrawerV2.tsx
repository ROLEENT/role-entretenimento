import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Minus, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
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
  note?: string; // Adicionar campo para notas do cadastro
}

interface CurationCriteriaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteria: CriterionData[];
  notes?: string;
  eventTitle?: string;
  curatorialCriteria?: any; // Dados do formulário de cadastro do evento
}

const CRITERIA_CONFIG: Record<CriterionKey, { label: string; description: string; formKey?: string }> = {
  relevancia: {
    label: 'Relevância Cultural',
    description: 'Diálogo real com a cena da cidade',
    formKey: 'cultural_relevance'
  },
  qualidade: {
    label: 'Qualidade Artística',
    description: 'Entrega consistente do line-up e proposta',
    formKey: 'lineup'
  },
  diversidade: {
    label: 'Diversidade e Inclusão',
    description: 'Representatividade no palco e na pista',
    formKey: 'visual_identity'
  },
  impacto: {
    label: 'Impacto Local',
    description: 'Contribuição para a comunidade e circulação',
    formKey: 'city_connection'
  },
  coerencia: {
    label: 'Coerência Curatorial',
    description: 'Conceito, narrativa e execução alinhados',
    formKey: 'audience_coherence'
  },
  experiencia: {
    label: 'Experiência do Público',
    description: 'Cuidado com acolhimento e fluidez',
    formKey: 'experience'
  },
  tecnica: {
    label: 'Técnica e Produção',
    description: 'Som, luz, segurança e operação',
    formKey: 'engagement_potential'
  },
  acessibilidade: {
    label: 'Acessibilidade',
    description: 'Informações claras, estrutura e preço justo',
    formKey: 'innovation'
  }
};

const STATUS_CONFIG = {
  met: { 
    icon: Check, 
    label: 'Atendido', 
    className: 'text-[#c77dff] bg-[#c77dff]/10 border-[#c77dff]/20' 
  },
  partial: { 
    icon: Minus, 
    label: 'Parcial', 
    className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' 
  },
  na: { 
    icon: X, 
    label: 'Não informado', 
    className: 'text-gray-400 bg-gray-400/10 border-gray-400/20' 
  }
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
  isPrimary,
  curatorialNote,
  curatorialCriteria
}: { 
  criterionKey: CriterionKey; 
  status: CriterionStatus; 
  isPrimary: boolean;
  curatorialNote?: string;
  curatorialCriteria?: any;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = CRITERIA_CONFIG[criterionKey];
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  // Buscar nota do formulário de cadastro
  const formNote = config.formKey && curatorialCriteria?.[config.formKey]?.note;
  const displayNote = curatorialNote || formNote || "Não informado";
  
  // Verificar se texto é muito longo (mais de 150 caracteres)
  const isLongText = displayNote.length > 150;
  const shouldTruncate = isLongText && !isExpanded;
  const displayText = shouldTruncate ? displayNote.substring(0, 150) + '...' : displayNote;

  return (
    <div className="rounded-xl border border-white/10 mb-3 overflow-hidden bg-white/[0.02]">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white text-base">{config.label}</h4>
              {isPrimary && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-[#c77dff]/30 text-[#c77dff]">
                  Destaque
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/60 mb-3">{config.description}</p>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border shrink-0 ml-3',
            statusConfig.className
          )}>
            <StatusIcon className="h-3 w-3" />
            <span className="font-medium">{statusConfig.label}</span>
          </div>
        </div>
        
        {/* Explicação do cadastro */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-white/80">Justificativa da curadoria:</h5>
          <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
            <p className="text-sm text-white/70 leading-relaxed">
              {displayText}
            </p>
            {isLongText && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 mt-2 text-xs text-[#c77dff] hover:text-[#c77dff]/80 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Ver menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Ver mais
                  </>
                )}
              </button>
            )}
          </div>
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
  eventTitle,
  curatorialCriteria
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
        <div className="md:bg-[#1a1a1a] md:rounded-xl md:max-w-3xl md:w-full md:max-h-[90vh] md:m-4 md:flex md:flex-col">
          {/* Header Fixo */}
          <div className="sticky top-0 z-10 bg-[#1a1a1a] rounded-t-xl md:rounded-t-xl border-b border-white/10 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 id="drawer-title" className="text-xl md:text-2xl font-bold text-white mb-1">
                  Como escolhemos este destaque?
                </h2>
                {eventTitle && (
                  <p className="text-sm text-white/60">{eventTitle}</p>
                )}
                
                {/* Contador de critérios */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-2 text-sm bg-[#c77dff]/10 border border-[#c77dff]/20 rounded-full px-3 py-1">
                    <div className="w-2 h-2 rounded-full bg-[#c77dff]" />
                    <span className="font-medium text-[#c77dff]">
                      {metCriteria} de {totalCriteria} critérios atendidos
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white shrink-0"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Scrollável */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)] md:max-h-[calc(80vh-200px)]">
            <div className="p-4 md:p-6 space-y-6">
            {/* Intro Text */}
            <div className="text-center">
              <p className="text-white/80 text-sm leading-relaxed">
                Este evento foi selecionado pela nossa curadoria com base nos critérios abaixo. 
                Cada critério foi avaliado considerando a proposta, contexto e impacto cultural.
              </p>
            </div>

            {/* Criteria List */}
            <div className="space-y-1">
              {criteria.map((criterion) => (
                <CriterionAccordionItem
                  key={criterion.key}
                  criterionKey={criterion.key}
                  status={criterion.status}
                  isPrimary={criterion.is_primary}
                  curatorialNote={criterion.note}
                  curatorialCriteria={curatorialCriteria}
                />
              ))}
            </div>

              {/* Notes */}
              {notes && (
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <h4 className="font-semibold text-white mb-3">Observações da Curadoria</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Fixo */}
          <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-white/10 p-4 md:p-6 rounded-b-xl md:rounded-b-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-[#c77dff] hover:bg-[#c77dff]/90 text-white font-medium h-11"
              >
                Entendi
              </Button>
              <Button
                variant="ghost"
                className="sm:w-auto text-white/60 hover:bg-white/5 hover:text-white h-11 text-sm"
                asChild
              >
                <a 
                  href="/sobre/politica-curatorial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
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