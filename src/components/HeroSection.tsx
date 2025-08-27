import { Button } from "./ui/button";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { useParallax } from "@/hooks/useParallax";
import { useResponsive } from "@/hooks/useResponsive";
import { Link } from "react-router-dom";
// import newHeroBanner from "@/assets/new-hero-banner.png";

const HeroSection = () => {
  const parallaxRef = useParallax(0.3);
  const { isMobile, isTablet } = useResponsive();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax and Overlay */}
      <div 
        ref={parallaxRef}
        className="absolute inset-0 z-0 parallax-bg scale-105"
      >
        <img
          src="/lovable-uploads/f4d291fd-617b-4bff-86cc-04b0f8665f5d.png"
          alt="Cultura e entretenimento"
          className="w-full h-full object-cover"
        />
        
      </div>

      {/* Content */}
      <div className={`relative z-10 container mx-auto ${isMobile ? 'px-4' : 'px-4'} text-center animate-fade-in`}>
        <div className="max-w-4xl mx-auto">

          <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-col sm:flex-row'} gap-4 justify-center items-center animate-scale-in`} style={{ animationDelay: '0.4s' }}>
            <Button
              variant="gradient"
              size={isMobile ? "default" : "lg"}
              className={`font-semibold ${isMobile ? 'w-full max-w-sm px-6 py-3' : 'px-8 py-4'} rounded-full shadow-glow transition-all duration-300 hover:scale-105 hover-lift touch-target`}
              asChild
            >
              <Link to="/eventos">
                <MapPin className="mr-2 h-5 w-5" />
                {isMobile ? 'Descubra o ROLÊ' : 'Descubra o ROLÊ na sua cidade'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size={isMobile ? "default" : "lg"}
              className={`font-semibold ${isMobile ? 'w-full max-w-sm px-6 py-3' : 'px-8 py-4'} rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 touch-target`}
              asChild
            >
              <Link to="/destaques">
                <Star className="mr-2 h-5 w-5" />
                Destaques da Semana
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;