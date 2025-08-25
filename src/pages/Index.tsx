import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedEventsToday from "@/components/FeaturedEventsToday";

import HowItWorks from "@/components/HowItWorks";
import MagazineBanner from "@/components/MagazineBanner";
import StatsSection from "@/components/StatsSection";
import Newsletter from "@/components/Newsletter";
import Testimonials from "@/components/Testimonials";
import PartnersVenues from "@/components/PartnersVenues";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import FavoritesPanel from "@/components/FavoritesPanel";
import GeolocationEvents from "@/components/GeolocationEvents";
import FeaturedHighlights from "@/components/FeaturedHighlights";
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import PWAFeatures from "@/components/PWAFeatures";
import { Toaster } from "@/components/ui/sonner";
import SEOOptimizations from "@/components/SEOOptimizations";
import AccessibilityEnhancements from "@/components/AccessibilityEnhancements";

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
        <main id="main-content">
          <HeroSection />
          <ScrollAnimationWrapper>
            <FeaturedHighlights />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <FeaturedEventsToday />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <GeolocationEvents />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <PersonalizedRecommendations />
          </ScrollAnimationWrapper>
          <FeaturedBlogPosts />
          <ScrollAnimationWrapper>
            <HowItWorks />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <MagazineBanner />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <StatsSection />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <Testimonials />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <PartnersVenues />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <FavoritesPanel />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <PWAFeatures />
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper>
            <Newsletter />
          </ScrollAnimationWrapper>
        </main>
        <Footer />
        <BackToTop />
        <Toaster />
      </div>
    </AccessibilityEnhancements>
  );
};

export default Index;
