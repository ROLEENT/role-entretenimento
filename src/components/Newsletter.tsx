import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-signup', {
        body: {
          email,
          name: name || undefined,
          preferences: {
            events: true,
            highlights: true,
            weekly: true
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Inscrição realizada!",
        description: data.requiresConfirmation 
          ? "Verifique seu email para confirmar sua inscrição."
          : "Você receberá nossos destaques semanais em breve.",
      });
      
      setEmail("");
      setName("");
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Erro na inscrição",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            📬 Receba os Melhores Eventos por Email
          </h2>
          <p className="text-lg text-muted-foreground mb-2">
            Cadastre-se para receber nossa seleção semanal dos eventos mais imperdíveis da sua cidade
          </p>
          
          <Button 
            variant="link" 
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary mb-6"
          >
            {showDetails ? "Ocultar detalhes" : "Como funciona?"}
          </Button>

          {showDetails && (
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4 text-center">🎯 Como Funciona a Newsletter do ROLÊ:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p><strong>📅 Quando:</strong> Toda sexta-feira</p>
                  <p><strong>📍 Onde:</strong> Eventos das principais capitais</p>
                  <p><strong>🎭 O que:</strong> Shows, teatro, exposições, festivais</p>
                </div>
                <div className="space-y-2">
                  <p><strong>🏆 Curadoria:</strong> Seleção dos nossos especialistas</p>
                  <p><strong>🎨 Formato:</strong> Visual, com fotos e descrições</p>
                  <p><strong>🔄 Frequência:</strong> Sem spam, apenas qualidade</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Seu nome (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
              />
              <Input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? "Inscrevendo..." : "📧 Quero Receber os Destaques!"}
            </Button>
          </form>

          <div className="mt-6 text-xs text-muted-foreground space-y-1">
            <p>✅ Enviamos apenas conteúdo de qualidade cultural</p>
            <p>🔒 Seus dados estão protegidos e nunca serão compartilhados</p>
            <p>❌ Cancele quando quiser com 1 clique</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;