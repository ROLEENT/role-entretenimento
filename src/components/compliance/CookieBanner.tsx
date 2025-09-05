import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { X, Settings, Shield, Eye, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultConsent: CookieConsent = {
  necessary: true, // Always true
  analytics: false,
  marketing: false,
  preferences: false,
};

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      setConsent(JSON.parse(savedConsent));
    }
  }, []);

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    localStorage.setItem('consent-timestamp', Date.now().toString());
    setConsent(consentData);
    setShowBanner(false);
    setShowSettings(false);
    
    // Aplicar configurações de cookies
    applyCookieSettings(consentData);
  };

  const applyCookieSettings = (consentData: CookieConsent) => {
    // Google Analytics
    if (consentData.analytics) {
      // Ativar GA
      (window as any).gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else {
      // Desativar GA
      (window as any).gtag?.('consent', 'update', {
        analytics_storage: 'denied'
      });
    }

    // Marketing
    if (consentData.marketing) {
      (window as any).gtag?.('consent', 'update', {
        ad_storage: 'granted'
      });
    } else {
      (window as any).gtag?.('consent', 'update', {
        ad_storage: 'denied'
      });
    }
  };

  const acceptAll = () => {
    const allConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allConsent);
  };

  const acceptNecessary = () => {
    saveConsent(defaultConsent);
  };

  if (!showBanner) return null;

  return (
    <>
      <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-background/95 backdrop-blur border-border shadow-lg md:max-w-md md:left-auto">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Cookies e Privacidade
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo. 
                Saiba mais em nossa <a href="/privacy" className="text-primary hover:underline">política de privacidade</a>.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="sm"
                onClick={acceptAll}
                className="text-xs"
              >
                Aceitar Todos
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={acceptNecessary}
                className="text-xs"
              >
                Apenas Necessários
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(true)}
                className="text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={acceptNecessary}
            className="flex-shrink-0 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Cookies
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Cookies Necessários</p>
                  <p className="text-xs text-muted-foreground">
                    Essenciais para o funcionamento do site
                  </p>
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Cookies de Análise</p>
                  <p className="text-xs text-muted-foreground">
                    Nos ajudam a entender como você usa o site
                  </p>
                </div>
              </div>
              <Switch
                checked={consent.analytics}
                onCheckedChange={(checked) =>
                  setConsent(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Cookies de Marketing</p>
                  <p className="text-xs text-muted-foreground">
                    Para personalizar anúncios e conteúdo
                  </p>
                </div>
              </div>
              <Switch
                checked={consent.marketing}
                onCheckedChange={(checked) =>
                  setConsent(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium text-sm">Cookies de Preferência</p>
                  <p className="text-xs text-muted-foreground">
                    Lembram suas configurações e preferências
                  </p>
                </div>
              </div>
              <Switch
                checked={consent.preferences}
                onCheckedChange={(checked) =>
                  setConsent(prev => ({ ...prev, preferences: checked }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => saveConsent(consent)}
              className="flex-1"
            >
              Salvar Preferências
            </Button>
            <Button
              variant="outline"
              onClick={acceptAll}
              className="flex-1"
            >
              Aceitar Todos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}