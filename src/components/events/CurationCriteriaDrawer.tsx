import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Minus, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import '../../styles/modal.css';

type CriterionStatus = 'met' | 'partial' | 'not_applicable' | 'not_informed';

interface CurationCriteriaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle?: string;
  curatorialCriteria?: any;
}

// Mapeamento dos critérios reais conforme solicitado
const CRITERIA_CONFIG = {
  cultural_relevance: {
    label: 'Relevância Cultural',
    description: 'Diálogo real com a cena da cidade'
  },
  lineup: {
    label: 'Qualidade Artística',
    description: 'Entrega consistente do line-up e proposta'
  },
  diversity_inclusion: {
    label: 'Diversidade e Inclusão',
    description: 'Representatividade no palco e na pista'
  },
  local_impact: {
    label: 'Impacto Local',
    description: 'Contribuição para a comunidade e circulação'
  },
  curatorial_coherence: {
    label: 'Coerência Curatorial',
    description: 'Conceito, narrativa e execução alinhados'
  },
  audience_experience: {
    label: 'Experiência do Público',
    description: 'Cuidado com acolhimento e fluidez'
  },
  city_connection: {
    label: 'Conexão com a cidade',
    description: 'Relação com o local e contexto urbano'
  },
  engagement_potential: {
    label: 'Potencial de engajamento',
    description: 'Capacidade de mobilizar e envolver o público'
  }
};

const STATUS_CONFIG = {
  met: { 
    icon: Check, 
    label: 'Atendido', 
    className: 'bg-success/10 text-success border-success/20' 
  },
  partial: { 
    icon: Minus, 
    label: 'Parcial', 
    className: 'bg-warning/10 text-warning border-warning/20' 
  },
  not_applicable: { 
    icon: X, 
    label: 'Não se aplica', 
    className: 'bg-muted text-muted-foreground border-border' 
  },
  not_informed: { 
    icon: X, 
    label: 'Não informado', 
    className: 'bg-destructive/10 text-destructive border-destructive/20' 
  }
};

function CriterionItem({ 
  criterionKey, 
  status, 
  justification
}: { 
  criterionKey: string; 
  status: CriterionStatus; 
  justification?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = CRITERIA_CONFIG[criterionKey as keyof typeof CRITERIA_CONFIG];
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  if (!config) return null;

  const displayJustification = justification || "Não informado";
  const isLongText = displayJustification.length > 200;
  const truncatedText = isLongText ? displayJustification.slice(0, 200) + "..." : displayJustification;

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-base text-foreground max-w-[80ch]">{config.label}</h4>
        <div className={cn(
          'flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border flex-shrink-0',
          statusConfig.className
        )}>
          <StatusIcon className="w-3 h-3" />
          <span className="font-medium">{statusConfig.label}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-foreground leading-relaxed max-w-[80ch]">
          {expanded || !isLongText ? displayJustification : truncatedText}
        </p>
        
        {isLongText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-primary hover:text-primary hover:bg-primary/10 p-0 h-auto text-sm"
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

  // Mapear dados dos critérios reais do evento
  const mappedCriteria = Object.keys(CRITERIA_CONFIG).map((key) => {
    const criterionData = curatorialCriteria?.[key];
    
    // Converter estrutura {checked: true/false, note: "text"} para status e justification
    let status: CriterionStatus = 'not_informed';
    let justification = '';
    
    if (criterionData) {
      if (criterionData.checked === true) {
        status = 'met';
      } else if (criterionData.checked === false) {
        status = 'not_applicable';
      }
      
      // Tentar múltiplas chaves para a justificativa
      justification = criterionData.note || 
                    criterionData.justification || 
                    criterionData.text || 
                    criterionData.motivo || 
                    '';
    }
    
    return {
      key,
      status,
      justification: justification || 'Não informado'
    };
  });
  
  // Contar apenas critérios com status 'met'
  const metCriteriaCount = mappedCriteria.filter(c => c.status === 'met').length;

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

  // Body scroll control
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className="modal"
      onClick={handleBackdropClick}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 50
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="curadoria-title"
        className="modal__dialog"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: 'min(960px, 95vw)',
          maxHeight: 'min(88vh, 920px)',
          background: 'hsl(var(--background))',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header fixo */}
        <div 
          className="modal__header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            background: 'linear-gradient(hsl(var(--background)) 85%, transparent)',
            borderBottom: '1px solid hsl(var(--border))',
            padding: '20px 24px 10px'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 
              id="curadoria-title"
              className="text-lg font-semibold text-foreground"
              tabIndex={-1}
            >
              Como escolhemos este destaque?
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeWithHistory}
              className="h-10 w-10 rounded-full border border-border hover:bg-muted text-foreground"
              aria-label="Fechar critérios de curadoria"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {eventTitle && (
            <p className="text-sm text-muted-foreground mt-1">
              Critérios para <span className="font-medium text-foreground">{eventTitle}</span>
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className="text-xs px-2.5 py-1 border-border text-foreground bg-transparent"
            >
              {metCriteriaCount} de 8 critérios atendidos
            </Badge>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div 
          className="modal__body"
          style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            padding: '12px 24px 24px'
          }}
        >
          <div className="space-y-4">
            {mappedCriteria.map((criterion) => (
              <CriterionItem
                key={criterion.key}
                criterionKey={criterion.key}
                status={criterion.status}
                justification={criterion.justification}
              />
            ))}
          </div>
        </div>

        {/* Footer fixo */}
        <div 
          className="modal__footer"
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            background: 'linear-gradient(transparent, hsl(var(--background)) 60%)',
            borderTop: '1px solid hsl(var(--border))',
            padding: '16px 24px',
            textAlign: 'center'
          }}
        >
          <Button 
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 mb-3"
            onClick={closeWithHistory}
          >
            Entendi
          </Button>
          
          <a 
            href="/politicas/curadoria" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 opacity-70"
          >
            <span>Política de curadoria</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}