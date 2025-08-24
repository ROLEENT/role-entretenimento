import { useEffect } from 'react';

interface AccessibilityEnhancementsProps {
  children: React.ReactNode;
}

const AccessibilityEnhancements = ({ children }: AccessibilityEnhancementsProps) => {
  useEffect(() => {
    // Add skip to main content link
    const addSkipLink = () => {
      const existingSkipLink = document.getElementById('skip-to-main');
      if (existingSkipLink) return;

      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-main';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Pular para o conteúdo principal';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium';
      skipLink.setAttribute('aria-label', 'Link para pular direto ao conteúdo principal da página');
      
      document.body.insertBefore(skipLink, document.body.firstChild);
    };

    // Improve focus management
    const enhanceFocusManagement = () => {
      let focusedBeforeModal: HTMLElement | null = null;

      // Store focus before modal opens
      document.addEventListener('focusin', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[role="dialog"]') || target.closest('[data-modal]')) {
          if (!focusedBeforeModal) {
            focusedBeforeModal = document.activeElement as HTMLElement;
          }
        }
      });

      // Restore focus when modal closes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (node instanceof HTMLElement && 
                (node.hasAttribute('role') && node.getAttribute('role') === 'dialog' ||
                 node.hasAttribute('data-modal'))) {
              if (focusedBeforeModal && document.contains(focusedBeforeModal)) {
                focusedBeforeModal.focus();
                focusedBeforeModal = null;
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    };

    // Add keyboard navigation for custom components
    const enhanceKeyboardNavigation = () => {
      document.addEventListener('keydown', (e) => {
        // Escape key closes modals/dropdowns
        if (e.key === 'Escape') {
          const openModal = document.querySelector('[role="dialog"][aria-modal="true"]');
          const openDropdown = document.querySelector('[data-state="open"]');
          
          if (openModal) {
            const closeButton = openModal.querySelector('[aria-label*="fechar"], [aria-label*="close"], [data-close]');
            if (closeButton instanceof HTMLElement) {
              closeButton.click();
            }
          } else if (openDropdown) {
            const trigger = document.querySelector(`[aria-controls="${openDropdown.id}"]`);
            if (trigger instanceof HTMLElement) {
              trigger.click();
              trigger.focus();
            }
          }
        }

        // Tab navigation improvements
        if (e.key === 'Tab') {
          const focusableElements = document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          // Trap focus in modals
          const modal = (e.target as HTMLElement).closest('[role="dialog"]');
          if (modal) {
            const modalFocusableElements = modal.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            const firstModalElement = modalFocusableElements[0] as HTMLElement;
            const lastModalElement = modalFocusableElements[modalFocusableElements.length - 1] as HTMLElement;

            if (e.shiftKey && document.activeElement === firstModalElement) {
              e.preventDefault();
              lastModalElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastModalElement) {
              e.preventDefault();
              firstModalElement.focus();
            }
          }
        }
      });
    };

    // Announce dynamic content changes
    const announceContentChanges = () => {
      const createAnnouncer = () => {
        const announcer = document.createElement('div');
        announcer.id = 'accessibility-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        return announcer;
      };

      let announcer = document.getElementById('accessibility-announcer') as HTMLElement;
      if (!announcer) {
        announcer = createAnnouncer();
      }

      // Announce page navigation
      const handleRouteChange = () => {
        setTimeout(() => {
          const pageTitle = document.title;
          const mainHeading = document.querySelector('h1')?.textContent;
          const announcement = mainHeading || pageTitle || 'Página carregada';
          
          announcer.textContent = `Navegou para: ${announcement}`;
          
          // Clear announcement after a delay
          setTimeout(() => {
            announcer.textContent = '';
          }, 1000);
        }, 100);
      };

      // Listen for history changes (SPA navigation)
      window.addEventListener('popstate', handleRouteChange);
      
      // Listen for programmatic navigation
      const originalPushState = history.pushState;
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        handleRouteChange();
      };

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        history.pushState = originalPushState;
      };
    };

    // Add loading announcements
    const announceLoadingStates = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Announce when loading starts
              if (node.textContent?.includes('Carregando') || 
                  node.querySelector('[data-loading]') ||
                  node.className.includes('skeleton')) {
                const announcer = document.getElementById('accessibility-announcer');
                if (announcer) {
                  announcer.textContent = 'Carregando conteúdo...';
                }
              }
              
              // Announce when content loads
              if (node.querySelector('[data-loaded]') || 
                  (mutation.target instanceof HTMLElement && 
                   mutation.target.getAttribute('data-loading') === 'false')) {
                const announcer = document.getElementById('accessibility-announcer');
                if (announcer) {
                  announcer.textContent = 'Conteúdo carregado';
                  setTimeout(() => {
                    announcer.textContent = '';
                  }, 1000);
                }
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-loading']
      });

      return () => observer.disconnect();
    };

    // Initialize all enhancements
    addSkipLink();
    const cleanupFocus = enhanceFocusManagement();
    enhanceKeyboardNavigation();
    const cleanupAnnouncements = announceContentChanges();
    const cleanupLoading = announceLoadingStates();

    // Cleanup function
    return () => {
      cleanupFocus();
      cleanupAnnouncements();
      cleanupLoading();
    };
  }, []);

  return <>{children}</>;
};

export default AccessibilityEnhancements;