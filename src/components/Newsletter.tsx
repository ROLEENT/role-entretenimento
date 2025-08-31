import React from "react";
import { Link } from "react-router-dom";
import { FormProvider } from "react-hook-form";
import { LoadingButton } from "@/components/ui/loading-button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/useResponsive";
import { useValidatedForm } from "@/hooks/useValidatedForm";
import { newsletterSchema } from "@/schemas/forms";
import { RHFValidatedInput } from "@/components/form";
import { Mail, Send } from "lucide-react";

const Newsletter = () => {
  const { isMobile } = useResponsive();
  const { toast } = useToast();

  const form = useValidatedForm({
    schema: newsletterSchema,
    defaultValues: {
      email: '',
      name: '',
      city: '',
      preferences: []
    },
    onSubmit: async (data) => {
      const { data: result, error } = await supabase.functions.invoke('forms-newsletter', {
        body: data,
      });

      if (error) throw error;

      if (result?.ok) {
        toast({
          title: "Inscrição realizada com sucesso! 🎉",
          description: "Você receberá nossa curadoria semanal em breve.",
        });
        form.reset();
      } else {
        throw new Error(result?.error || 'Erro na inscrição');
      }
    },
    showToastOnError: true,
  });

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
          
          <FormProvider {...form}>
            <form onSubmit={form.submitHandler} className="mb-6">
              <div className={`flex ${isMobile ? 'flex-col gap-4' : 'gap-4 max-w-3xl mx-auto'}`}>
                <div className="relative flex-1">
                  <RHFValidatedInput
                    name="email"
                    type="email"
                    placeholder="Digite seu melhor email aqui"
                    prefix={<Mail className="h-5 w-5" />}
                    className={`${isMobile ? 'h-14 text-base' : 'h-16 text-lg'} pl-14 pr-6 rounded-full border-2 focus:border-primary font-medium bg-background/80 backdrop-blur-sm`}
                    required
                    autoComplete="email"
                  />
                </div>
                <LoadingButton 
                  type="submit" 
                  loading={form.isSubmitting}
                  loadingText="Enviando..."
                  size="lg"
                  className={`${isMobile ? 'h-14 px-8 text-base' : 'h-16 px-12 text-lg'} rounded-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-0 group transition-all duration-300 hover:scale-105 hover:shadow-xl`}
                >
                  {form.isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Mail className="h-5 w-5 group-hover:animate-bounce-subtle" />
                      Quero receber
                      <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </LoadingButton>
              </div>
            </form>
          </FormProvider>

          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            Prometemos não enviar spam. Consulte nossa{" "}
            <Link to="/politica-privacidade" className="text-primary hover:underline font-medium">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;