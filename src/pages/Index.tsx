import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import EventCategories from "@/components/EventCategories";
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ScrollAnimationWrapper>
          <EventCategories />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <FeaturedEventsToday />
        </ScrollAnimationWrapper>
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
          <Newsletter />
        </ScrollAnimationWrapper>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
