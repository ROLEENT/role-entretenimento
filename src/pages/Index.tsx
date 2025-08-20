import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import EventCategories from "@/components/EventCategories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <EventCategories />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
