import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    <section className="py-16 bg-muted/30" aria-labelledby="newsletter-title">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 id="newsletter-title" className="text-3xl font-bold text-foreground mb-4">
            Não perca o melhor do ROLÊ
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Assine a newsletter e receba semanalmente o que tem de mais relevante na cena cultural.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Seu nome (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
                autoComplete="name"
              />
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                autoComplete="email"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto sm:px-8">
              {isLoading ? "Enviando..." : "Assinar Newsletter"}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground mt-4">
            Ao assinar, você concorda com nossa{" "}
            <a href="/politica" className="text-primary hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;