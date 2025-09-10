import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        
        {/* Subtitle in ROLÊ tone */}
        <h2 className="text-xl font-semibold mb-3 text-foreground">
          Essa página não tá no rolê
        </h2>
        
        {/* Message in ROLÊ tone */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          A página que você procura não existe ou foi removida. 
          Que tal dar uma volta pela home?
        </p>

        {/* Action button */}
        <Link 
          to="/" 
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Voltar pro início
        </Link>
        
        {/* Additional help */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda? 
            <Link 
              to="/fale-conosco" 
              className="text-primary hover:text-primary/80 font-medium ml-1"
            >
              Fale conosco
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
