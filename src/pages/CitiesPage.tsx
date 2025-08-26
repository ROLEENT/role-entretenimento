import CitiesGrid from "@/components/CitiesGrid";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { Toaster } from "@/components/ui/sonner";
import SEOOptimizations from "@/components/SEOOptimizations";
import AccessibilityEnhancements from "@/components/AccessibilityEnhancements";

const CitiesPage = () => {
  return (
    <AccessibilityEnhancements>
      <SEOOptimizations 
        title="Cidades - ROLÊ | Eventos Culturais do Brasil"
        description="Explore a cena cultural das principais cidades brasileiras: São Paulo, Rio de Janeiro, Porto Alegre, Florianópolis e Curitiba."
        tags={['cidades', 'cultura', 'eventos', 'brasil', 'agenda cultural']}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="mt-0">
          <div className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">CIDADES DO BRASIL</h1>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                  Descubra a vibrante cena cultural das principais cidades brasileiras. 
                  Cada cidade tem sua personalidade única, com eventos, shows, peças e exposições 
                  que refletem a diversidade cultural do nosso país.
                </p>
              </div>
            </div>
          </div>
          
          <ScrollAnimationWrapper>
            <CitiesGrid />
          </ScrollAnimationWrapper>
        </main>
        <Footer />
        <NotificationPermissionPrompt />
        <BackToTop />
        <Toaster />
      </div>
    </AccessibilityEnhancements>
  );
};

export default CitiesPage;