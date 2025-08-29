import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/useResponsive";
import { Mail, Send, Sparkles } from "lucide-react";

const Newsletter = () => {
  const { isMobile } = useResponsive();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
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
          name: null,
        },
      });

      if (error) throw error;

      toast({
        title: "Inscrição realizada com sucesso! 🎉",
        description: "Você receberá nossa curadoria semanal em breve.",
      });

      setEmail("");
    } catch (error) {
      console.error('Erro na inscrição:', error);
      toast({
        title: "Erro na inscrição",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`${isMobile ? 'py-16' : 'py-24'} bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`${isMobile ? 'max-w-lg' : 'max-w-3xl'} mx-auto text-center`}>
          <div className="mb-12">
            <h2 className={`font-heading font-bold text-foreground ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} mb-6`}>
              RECEBA OS MELHORES EVENTOS DA SEMANA
            </h2>
            <p className={`text-muted-foreground ${isMobile ? 'text-lg' : 'text-xl'} max-w-2xl mx-auto`}>
              Seleção curada direto no seu email
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="mb-8">
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'gap-4 max-w-2xl mx-auto'}`}>
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${isMobile ? 'h-14 text-lg' : 'h-16 text-lg'} pl-12 rounded-full border-2 focus:border-primary font-medium`}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                size="lg"
                className={`${isMobile ? 'h-14 px-8 text-lg' : 'h-16 px-10 text-lg'} rounded-full font-bold group transition-all duration-300 hover:scale-105 hover:shadow-glow`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 group-hover:animate-bounce-subtle" />
                    Quero receber
                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            📧 Curadoria semanal • 🚫 Sem spam • 🔒 Dados protegidos • ✨ Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;