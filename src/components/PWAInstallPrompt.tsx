import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWA_STORAGE_KEY = 'pwa-prompt-dismissed';
const PWA_DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const PWA_SHOW_DELAY = 5000; // 5 seconds

export const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showAfterDelay, setShowAfterDelay] = useState(false);
  const location = useLocation();
  const { isInstallable, installApp, isInstalled } = usePWA();

  // Don't show PWA banner in admin routes
  const isAdminRoute = location.pathname.startsWith('/admin-v3') || 
                       location.pathname.startsWith('/admin-v2') || 
                       location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute || !isInstallable || isInstalled) {
      return;
    }

    // Check if user dismissed recently
    const dismissedTime = localStorage.getItem(PWA_STORAGE_KEY);
    if (dismissedTime) {
      const timeSinceDismiss = Date.now() - parseInt(dismissedTime);
      if (timeSinceDismiss < PWA_DISMISS_DURATION) {
        return;
      }
    }

    // Show after delay
    const timer = setTimeout(() => {
      setShowAfterDelay(true);
      setIsVisible(true);
    }, PWA_SHOW_DELAY);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isAdminRoute]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(PWA_STORAGE_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    try {
      await installApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  };
  
  if (!showAfterDelay || !isInstallable || isInstalled || !isVisible || isAdminRoute) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-primary text-primary-foreground shadow-card md:left-auto md:right-4 md:w-80 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Smartphone className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Instalar ROLÊ</h3>
            <p className="text-chip text-primary-foreground/80 mt-1">
              Instale o app para acesso rápido e notificações de novos eventos
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleInstall}
                className="text-chip h-8 focus-visible"
                aria-label="Instalar aplicativo ROLÊ"
              >
                <Download className="h-3 w-3 mr-1" aria-hidden="true" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-chip h-8 text-primary-foreground hover:bg-primary-foreground/10 focus-visible"
                aria-label="Instalar depois"
              >
                Depois
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/10 focus-visible"
            aria-label="Fechar prompt de instalação"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};