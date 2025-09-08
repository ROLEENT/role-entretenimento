import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Minus, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CriterionKey = 'relevancia' | 'qualidade' | 'diversidade' | 'impacto' | 'coerencia' | 'experiencia' | 'tecnica' | 'acessibilidade';
export type CriterionStatus = 'met' | 'partial' | 'na' | 'not_informed';

interface CriterionData {
  key: CriterionKey;
  status: CriterionStatus;
  is_primary: boolean;
  justification?: string;
}

interface CurationCriteriaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteria: CriterionData[];
  notes?: string;
  eventTitle?: string;
  curatorialCriteria?: any;
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
  met: { icon: Check, label: 'Atendido', className: 'text-green-600 bg-green-100 border-green-300' },
  partial: { icon: Minus, label: 'Parcial', className: 'text-yellow-600 bg-yellow-100 border-yellow-300' },
  na: { icon: X, label: 'Não se aplica', className: 'text-gray-500 bg-gray-100 border-gray-300' },
  not_informed: { icon: X, label: 'Não informado', className: 'text-red-500 bg-red-100 border-red-300' }
};

function CriterionItem({ 
  criterionKey, 
  status, 
  isPrimary,
  justification
}: { 
  criterionKey: CriterionKey; 
  status: CriterionStatus; 
  isPrimary: boolean;
  justification?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = CRITERIA_CONFIG[criterionKey];
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const displayJustification = justification || "Não informado";
  const isLongText = displayJustification.length > 200;
  const truncatedText = isLongText ? displayJustification.slice(0, 200) + "..." : displayJustification;

  return (
    <div className="border border-white/10 rounded-xl p-4 space-y-3 bg-white/[0.02]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-base text-white">{config.label}</h4>
          {isPrimary && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-[#c77dff] text-[#c77dff]">
              Destaque
            </Badge>
          )}
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border',
          statusConfig.className
        )}>
          <StatusIcon className="w-3 h-3" />
          <span className="font-medium">{statusConfig.label}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-neutral-300 leading-relaxed">
          {expanded || !isLongText ? displayJustification : truncatedText}
        </p>
        
        {isLongText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-[#c77dff] hover:text-[#c77dff] hover:bg-[#c77dff]/10 p-0 h-auto text-sm"
          >
            <span className="flex items-center gap-1">
              {expanded ? (
                <>
                  Ver menos
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Ver mais
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

function useDrawerKeyboard(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
}

function useDrawerHistory(open: boolean, onClose: () => void) {
  const [hasHistoryEntry, setHasHistoryEntry] = useState(false);

  useEffect(() => {
    if (open && !hasHistoryEntry) {
      // Push state ao abrir
      history.pushState({ drawerOpen: true }, '');
      setHasHistoryEntry(true);
    }
  }, [open, hasHistoryEntry]);

  useEffect(() => {
    if (!open) return;

    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.drawerOpen) {
        return; // Não fechar se é nosso próprio state
      }
      onClose();
      setHasHistoryEntry(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [open, onClose]);

  const closeWithHistory = () => {
    if (hasHistoryEntry) {
      history.back();
      setHasHistoryEntry(false);
    } else {
      onClose();
    }
  };

  return closeWithHistory;
}

function useDrawerBodyScroll(open: boolean) {
  useEffect(() => {
    if (open) {
      // Bloquear scroll do body
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);
}

function useFocusTrap(open: boolean, onClose: () => void) {
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Salvar elemento focado anteriormente
      lastFocusedElement.current = document.activeElement as HTMLElement;
      
      // Focar no título do drawer
      setTimeout(() => {
        const titleElement = drawerRef.current?.querySelector('#curadoria-title') as HTMLElement;
        titleElement?.focus();
      }, 100);
    } else {
      // Restaurar foco ao elemento anterior
      setTimeout(() => {
        lastFocusedElement.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  return drawerRef;
}

export function CurationCriteriaDrawer({ 
  open, 
  onOpenChange, 
  criteria, 
  notes, 
  eventTitle,
  curatorialCriteria 
}: CurationCriteriaDrawerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const closeDrawer = () => onOpenChange(false);
  const closeWithHistory = useDrawerHistory(open, closeDrawer);
  
  // Hooks para comportamento do drawer
  useDrawerKeyboard(open, closeWithHistory);
  useDrawerBodyScroll(open);
  const drawerRef = useFocusTrap(open, closeWithHistory);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const score = criteria.reduce((acc, c) => {
    if (c.status === 'met') return acc + 1;
    if (c.status === 'partial') return acc + 0.5;
    return acc;
  }, 0);

  // Mapear dados dos critérios reais do evento
  const mappedCriteria = Object.keys(CRITERIA_CONFIG).map((key) => {
    const criterionKey = key as CriterionKey;
    const criterion = criteria.find(c => c.key === criterionKey);
    const curatedData = curatorialCriteria?.[criterionKey];
    
    return {
      key: criterionKey,
      status: criterion?.status || 'not_informed',
      is_primary: criterion?.is_primary || false,
      justification: curatedData?.justification || criterion?.justification
    };
  });

  // Swipe down para fechar no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -50; // Swipe para baixo > 50px
    
    if (isDownSwipe && isMobile) {
      closeWithHistory();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeWithHistory();
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Drawer/Modal */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="curadoria-title"
        className={cn(
          "relative w-full bg-neutral-900 text-[#f3f3f7]",
          isMobile ? 
            "rounded-t-2xl max-h-[90vh]" : 
            "rounded-2xl max-w-2xl max-h-[80vh] mx-4"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header fixo */}
        <div className="px-4 py-3 sticky top-0 bg-neutral-900/95 backdrop-blur border-b border-white/10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 
              id="curadoria-title"
              className="text-lg font-semibold"
              tabIndex={-1}
            >
              Como escolhemos este destaque
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeWithHistory}
              className="h-10 w-10 rounded-full border border-white/15 hover:bg-white/10"
              aria-label="Fechar critérios de curadoria"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {eventTitle && (
            <p className="text-sm text-neutral-400 mt-1">
              Critérios para <span className="font-medium text-white">{eventTitle}</span>
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs px-2.5 py-1 border-white/15">
              {score} de 8 critérios atendidos
            </Badge>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="px-4 py-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
          <div className="space-y-4">
            {mappedCriteria.map((criterion) => (
              <CriterionItem
                key={criterion.key}
                criterionKey={criterion.key}
                status={criterion.status}
                isPrimary={criterion.is_primary}
                justification={criterion.justification}
              />
            ))}
          </div>

          {notes && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold text-white">Notas da Curadoria</h4>
              <p className="text-sm text-neutral-300 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">
                {notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer fixo */}
        <div className="px-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-3 sticky bottom-0 bg-neutral-900/95 backdrop-blur border-t border-white/10 space-y-3">
          <Button 
            className="w-full h-11 rounded-xl bg-[#c77dff] text-black font-semibold hover:bg-[#c77dff]/90"
            onClick={closeWithHistory}
          >
            Entendi
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full h-11 rounded-xl hover:bg-white/5"
            asChild
          >
            <a 
              href="/politicas/curadoria" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <span>Política de curadoria</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}