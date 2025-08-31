"use client";
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const { toast } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    
    setState("loading");
    
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        if (error.code === '23505') { // Unique violation - already subscribed
          toast({
            title: "Já inscrito!",
            description: "Este email já está na nossa lista.",
          });
          setState("done");
          setEmail("");
        } else {
          throw error;
        }
      } else {
        setState("done");
        setEmail("");
        toast({
          title: "Inscrição confirmada! 🎉",
          description: "Você receberá nossa curadoria semanal em breve.",
        });
      }
    } catch (error) {
      console.error('Erro na inscrição:', error);
      setState("error");
      toast({
        title: "Erro na inscrição",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    }
  }

  return (
    <section className="py-12 bg-gradient-to-br from-accent/10 to-muted/20 rounded-lg">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Receba os melhores eventos da semana
        </h2>
        <p className="text-muted-foreground mb-6">
          Seleção curada direto no seu e-mail.
        </p>
        
        <form onSubmit={onSubmit} className="flex gap-2 max-w-md mx-auto">
          <label className="sr-only" htmlFor="nl-email">Seu e-mail</label>
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="nl-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu melhor e-mail"
              className="h-10 w-full pl-10 pr-3 rounded-md border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={state === "loading"}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium"
          >
            {state === "loading" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Quero receber
              </>
            )}
          </button>
        </form>
        
        {state === "done" && (
          <p className="text-center text-sm text-green-600 mt-3">
            Inscrição confirmada. Valeu!
          </p>
        )}
        {state === "error" && (
          <p className="text-center text-sm text-destructive mt-3">
            Não foi possível assinar agora. Tente de novo.
          </p>
        )}
      </div>
    </section>
  );
}