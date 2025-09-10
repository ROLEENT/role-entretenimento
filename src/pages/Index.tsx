import Header, { HeaderGlobalSearch } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { QuickLinks } from "@/components/home/QuickLinks";
import { WeeklyHighlights } from "@/components/home/WeeklyHighlights";
import { EventCarousels } from "@/components/home/EventCarousels";
import AgendaPorCidadeHome from "@/components/AgendaPorCidadeHome";
import BlocoRevista from "@/components/BlocoRevista";
import { FeaturedEventsToday } from "@/components/FeaturedEventsToday";
import RoleEmNumeros from "@/components/RoleEmNumeros";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { Toaster } from "@/components/ui/sonner";
import SEOOptimizations from "@/components/SEOOptimizations";
import AccessibilityEnhancements from "@/components/AccessibilityEnhancements";
import { AdminAccessButton } from "@/components/AdminAccessButton";
import RealEventsTestPanel from "@/components/RealEventsTestPanel";

const Index = () => {
  return (
    <AccessibilityEnhancements>
      <SEOOptimizations 
        title="ROLÊ - Curadoria Independente de Cultura & Experiências"
        description="Conectamos pessoas através de experiências culturais autênticas. Agenda completa com shows, peças, exposições e eventos em São Paulo, Rio de Janeiro, Porto Alegre, Florianópolis e Curitiba."
        tags={['eventos', 'cultura', 'agenda', 'curadoria', 'shows', 'teatro', 'exposições', 'brasil', 'entretenimento']}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="mt-0">
          {/* 1. HERO / TOPO */}
          <HeroSection />
          
          {/* 2. ATALHOS RÁPIDOS */}
          <ScrollAnimationWrapper>
            <QuickLinks />
          </ScrollAnimationWrapper>
          
          {/* 3. DESTAQUES DA SEMANA */}
          <ScrollAnimationWrapper>
            <WeeklyHighlights />
          </ScrollAnimationWrapper>
          
          {/* 4. CARROSSÉIS POR CATEGORIA */}
          <ScrollAnimationWrapper>
            <EventCarousels />
          </ScrollAnimationWrapper>
          
          {/* 5. AGENDA POR CIDADE */}
          <ScrollAnimationWrapper>
            <AgendaPorCidadeHome />
          </ScrollAnimationWrapper>
          
          {/* 6. BLOCO REVISTA */}
          <ScrollAnimationWrapper>
            <BlocoRevista />
          </ScrollAnimationWrapper>
          
          {/* 7. EVENTOS EM DESTAQUE */}
          <ScrollAnimationWrapper>
            <FeaturedEventsToday />
          </ScrollAnimationWrapper>
          
          {/* 8. ROLÊ EM NÚMEROS */}
          <ScrollAnimationWrapper>
            <RoleEmNumeros />
          </ScrollAnimationWrapper>
          
          {/* 9. NEWSLETTER */}
          <ScrollAnimationWrapper>
            <Newsletter />
          </ScrollAnimationWrapper>
        </main>
        
        {/* 8. FOOTER */}
        <Footer />
        
        <NotificationPermissionPrompt />
        <AdminAccessButton />
        {process.env.NODE_ENV === 'development' && <RealEventsTestPanel />}
        <BackToTop />
        <HeaderGlobalSearch />
        <Toaster />
      </div>
    </AccessibilityEnhancements>
  );
};

export default Index;
