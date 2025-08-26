import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { CityHighlightSlider } from "@/components/CityHighlightSlider";
import StatsSection from "@/components/StatsSection";
import FeaturedEventsToday from "@/components/FeaturedEventsToday";
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { Toaster } from "@/components/ui/sonner";
import SEOOptimizations from "@/components/SEOOptimizations";
import AccessibilityEnhancements from "@/components/AccessibilityEnhancements";
import { GoogleAdSense } from "@/components/GoogleAdSense";
// Removed: Chatbot import

const Index = () => {
  return (
    <AccessibilityEnhancements>
      <SEOOptimizations 
        title="ROLÊ - Descubra os Melhores Eventos Culturais do Brasil"
        description="Agenda cultural completa com shows, peças, exposições e eventos em São Paulo, Rio de Janeiro, Porto Alegre, Florianópolis e Curitiba."
        tags={['eventos', 'cultura', 'agenda', 'shows', 'teatro', 'exposições', 'brasil']}
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="mt-0">
          <HeroSection />
          
          <ScrollAnimationWrapper>
            <StatsSection />
          </ScrollAnimationWrapper>
          
          <div className="container mx-auto px-4 space-y-8">
            <ScrollAnimationWrapper>
              <CityHighlightSlider 
                city="porto_alegre" 
                title="Porto Alegre" 
                citySlug="porto-alegre"
              />
            </ScrollAnimationWrapper>
            
            <ScrollAnimationWrapper>
              <CityHighlightSlider 
                city="sao_paulo" 
                title="São Paulo" 
                citySlug="sao-paulo"
              />
            </ScrollAnimationWrapper>
            
            <ScrollAnimationWrapper>
              <CityHighlightSlider 
                city="florianopolis" 
                title="Florianópolis" 
                citySlug="florianopolis"
              />
            </ScrollAnimationWrapper>
          </div>
          
          <ScrollAnimationWrapper>
            <FeaturedEventsToday />
          </ScrollAnimationWrapper>
          
          <ScrollAnimationWrapper>
            <FeaturedBlogPosts />
          </ScrollAnimationWrapper>
          
          <ScrollAnimationWrapper>
            <Newsletter />
          </ScrollAnimationWrapper>
        </main>
        <GoogleAdSense position="footer" pageType="homepage" />
        <Footer />
        <NotificationPermissionPrompt />
        <BackToTop />
        {/* Removed: Chatbot component */}
        <Toaster />
      </div>
    </AccessibilityEnhancements>
  );
};

export default Index;
