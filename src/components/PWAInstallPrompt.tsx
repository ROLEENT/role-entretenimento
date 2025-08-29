import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const { isInstallable, installApp, isInstalled } = usePWA();

  // Don't show PWA banner in admin routes
  const isAdminRoute = location.pathname.startsWith('/admin-v3');
  
  if (!isInstallable || isInstalled || !isVisible || isAdminRoute) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-primary text-primary-foreground shadow-lg md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Instalar ROLÊ</h3>
            <p className="text-xs text-primary-foreground/80 mt-1">
              Instale o app para acesso rápido e notificações de novos eventos
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={installApp}
                className="text-xs h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="text-xs h-8 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Depois
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};