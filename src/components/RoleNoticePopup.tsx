import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRoleNotice } from '@/hooks/useRoleNotice';
import { FocusTrap } from '@/components/ui/focus-trap';
import { MessageSquare, X, Clock } from 'lucide-react';

interface RoleNoticePopupProps {
  whatsNumber?: string;
  snoozeDays?: number;
  excludePaths?: string[];
}

export const RoleNoticePopup: React.FC<RoleNoticePopupProps> = (props) => {
  const { showNotice, isVisible, closeNotice, snoozeNotice, handleWhatsAppClick } = useRoleNotice(props);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle ESC key and backdrop click
  useEffect(() => {
    if (!showNotice) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNotice();
      }
    };

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === overlayRef.current) {
        closeNotice();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleBackdropClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleBackdropClick);
    };
  }, [showNotice, closeNotice]);

  if (!showNotice) return null;

  const modalContent = (
    <div 
      ref={overlayRef}
      className={`role-popup-overlay fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible 
          ? 'bg-black/50 backdrop-blur-sm' 
          : 'bg-black/0 backdrop-blur-none'
      }`}
      style={{ pointerEvents: showNotice ? 'auto' : 'none' }}
    >
      <FocusTrap active={isVisible}>
        <div 
          className={`role-popup-content relative w-full max-w-lg bg-background border border-border rounded-lg shadow-elevated transition-all duration-300 ${
            isVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-notice-title"
          aria-describedby="role-notice-description"
        >
          {/* Close button */}
          <button
            onClick={closeNotice}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
            aria-label="Fechar aviso"
            data-close
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div className="p-6 pb-4">
            {/* Header */}
            <div className="mb-4">
              <h2 
                id="role-notice-title"
                className="text-xl font-semibold text-foreground mb-2"
              >
                O site tá em construção
              </h2>
              <p 
                id="role-notice-description"
                className="text-muted-foreground leading-relaxed"
              >
                Estamos arrumando a casa. Você pode encontrar algo fora do lugar. 
                Se notar erro ou inconsistência, me chama no Whats. Valeu por colar no ROLÊ.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <MessageSquare size={16} />
                Falar no Whats
              </button>
              
              <button
                onClick={closeNotice}
                className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                Fechar
              </button>
              
              <button
                onClick={snoozeNotice}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-muted-foreground border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2"
              >
                <Clock size={16} />
                Não mostrar por 7 dias
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-muted-foreground text-center">
              Você pode fechar quando quiser. Prometo não insistir.
            </p>
          </div>
        </div>
      </FocusTrap>
    </div>
  );

  return createPortal(modalContent, document.body);
};