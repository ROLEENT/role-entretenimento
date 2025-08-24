import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

interface PWAInstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const PWAInstallButton = ({ 
  variant = 'default', 
  size = 'default',
  showIcon = true,
  className = ''
}: PWAInstallButtonProps) => {
  const { isInstallable, installApp, isInstalled } = usePWA();

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <Button 
      onClick={installApp}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <Download className="w-4 h-4 mr-2" />}
      Instalar App
    </Button>
  );
};

interface PWAPromptCardProps {
  onDismiss?: () => void;
}

export const PWAPromptCard = ({ onDismiss }: PWAPromptCardProps) => {
  const { isInstallable, installApp, isInstalled } = usePWA();

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-card border rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Instale o ROLÊ
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Acesse rapidamente eventos e destaques culturais, mesmo offline.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={installApp} className="text-xs">
                Instalar
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDismiss}
                className="text-xs"
              >
                Depois
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};