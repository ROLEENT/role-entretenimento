import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import EventCategories from "@/components/EventCategories";
import FeaturedHighlights from "@/components/FeaturedHighlights";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <EventCategories />
        <FeaturedHighlights />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
