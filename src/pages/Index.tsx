import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedEventsToday from "@/components/FeaturedEventsToday";
import MusicCategories from "@/components/MusicCategories";
import HowItWorks from "@/components/HowItWorks";
import MagazineBanner from "@/components/MagazineBanner";
import AdvertisementBanner from "@/components/AdvertisementBanner";
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
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
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
        <FeaturedBlogPosts />
        <ScrollAnimationWrapper>
          <MusicCategories />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <AdvertisementBanner />
        </ScrollAnimationWrapper>
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
          <Newsletter />
        </ScrollAnimationWrapper>
        
        <ScrollAnimationWrapper>
          <div className="py-8 bg-background">
            <div className="container mx-auto px-4 text-center">
              <PWAInstallButton 
                variant="outline" 
                size="lg" 
              />
            </div>
          </div>
        </ScrollAnimationWrapper>
      </main>
      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
};

export default Index;
