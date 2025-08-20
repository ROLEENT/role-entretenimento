import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import EventCategories from "@/components/EventCategories";
import HowItWorks from "@/components/HowItWorks";
import MagazineBanner from "@/components/MagazineBanner";
import StatsSection from "@/components/StatsSection";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <EventCategories />
        <HowItWorks />
        <MagazineBanner />
        <StatsSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
