import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

const ServerError = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "500 Error: Server error occurred on route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Icon */}
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 mx-auto text-destructive" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 text-foreground">500</h1>
        
        {/* Subtitle in ROLÊ tone */}
        <h2 className="text-xl font-semibold mb-3 text-foreground">
          Eita, deu ruim no servidor
        </h2>
        
        {/* Message in ROLÊ tone */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Nosso sistema tá com soluço. Já fomos acionados e vamos resolver rapidinho. 
          Enquanto isso, tenta uma dessas opções aí:
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleReload}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleClearCache}
            className="w-full"
          >
            Limpar cache e tentar
          </Button>
          
          <Button 
            variant="ghost" 
            asChild
            className="w-full"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar pro início
            </Link>
          </Button>
        </div>

        {/* Additional help */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Se o problema persistir, manda um salve pra gente:
          </p>
          <Link 
            to="/fale-conosco" 
            className="text-sm text-primary hover:text-primary/80 font-medium mt-2 inline-block"
          >
            Fale conosco
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServerError;